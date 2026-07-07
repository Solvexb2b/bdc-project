import { Router } from "express";
import { db } from "@workspace/db";
import { crawledProblemsTable, problemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// ── Real HN fetcher ────────────────────────────────────────────────────────────
async function fetchHN(limit: number) {
  const res = await fetch("https://hacker-news.firebaseio.com/v0/askstories.json");
  const ids: number[] = await res.json();
  const top = ids.slice(0, limit * 3);
  const items = await Promise.all(
    top.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
  );
  return items
    .filter((i: any) => i && i.title && i.score > 5 && !i.deleted)
    .slice(0, limit)
    .map((i: any) => ({
      externalId: `hn-${i.id}`,
      platform: "hackernews",
      title: i.title,
      description: i.text?.replace(/<[^>]+>/g, "").slice(0, 800) || `Ask HN: ${i.title}`,
      sourceUrl: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
      suggestedCategory: "technical",
      suggestedPayment: String(Math.max(500, Math.min(i.score * 10, 5000))),
      aiSummary: `HN Ask thread with ${i.score} points and ${i.descendants || 0} comments. Community-validated unsolved problem.`,
      upvotes: i.score,
    }));
}

// ── Real Reddit fetcher ────────────────────────────────────────────────────────
async function fetchReddit(subreddit: string, limit: number) {
  const res = await fetch(
    `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=week`,
    { headers: { "User-Agent": "SolveX-Crawler/1.0" } }
  );
  const json: any = await res.json();
  return (json?.data?.children || [])
    .map((c: any) => c.data)
    .filter((p: any) => p.selftext && p.selftext.length > 50 && !p.is_video)
    .slice(0, limit)
    .map((p: any) => ({
      externalId: `reddit-${p.id}`,
      platform: "reddit",
      title: p.title,
      description: p.selftext.slice(0, 800),
      sourceUrl: `https://reddit.com${p.permalink}`,
      suggestedCategory: subreddit.includes("finance") || subreddit.includes("invest") ? "financial" : "technical",
      suggestedPayment: String(Math.max(300, Math.min(p.score * 5, 3000))),
      aiSummary: `r/${subreddit} post with ${p.score} upvotes and ${p.num_comments} comments. Active community problem.`,
      upvotes: p.score,
    }));
}

// ── Real StackOverflow fetcher ─────────────────────────────────────────────────
async function fetchStackOverflow(limit: number) {
  const res = await fetch(
    `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=architecture&site=stackoverflow&pagesize=${limit}&filter=withbody`,
  );
  const json: any = await res.json();
  return (json?.items || [])
    .filter((q: any) => !q.is_answered && q.score > 2)
    .slice(0, limit)
    .map((q: any) => ({
      externalId: `so-${q.question_id}`,
      platform: "stackoverflow",
      title: q.title,
      description: q.body?.replace(/<[^>]+>/g, "").slice(0, 800) || q.title,
      sourceUrl: q.link,
      suggestedCategory: "technical",
      suggestedPayment: String(Math.max(400, Math.min(q.score * 15, 4000))),
      aiSummary: `Unanswered SO question with ${q.score} votes and ${q.view_count} views. High-value unsolved technical problem.`,
      upvotes: q.score,
    }));
}

router.post("/crawler/run", async (req, res) => {
  const { limit = 4 } = req.body;
  const n = Math.min(Number(limit), 8);
  const found: any[] = [];
  const errors: string[] = [];

  const sources: Promise<any[]>[] = [
    fetchHN(n).catch(e => { errors.push(`HN: ${e.message}`); return []; }),
    fetchReddit("cscareerquestions", n).catch(e => { errors.push(`Reddit: ${e.message}`); return []; }),
    fetchStackOverflow(n).catch(e => { errors.push(`SO: ${e.message}`); return []; }),
  ];

  const results = await Promise.all(sources);
  const all = results.flat();

  for (const item of all) {
    try {
      const existing = await db.select().from(crawledProblemsTable)
        .where(eq(crawledProblemsTable.externalId, item.externalId)).limit(1);
      if (existing.length > 0) continue;
      const [inserted] = await db.insert(crawledProblemsTable).values(item).returning();
      found.push(inserted);
    } catch {
      // skip duplicates
    }
  }

  res.json({ found: found.length, problems: found, errors });
});

router.get("/crawler/crawled", async (req, res) => {
  try {
    const { platform, limit = "20", offset = "0" } = req.query as Record<string, string>;
    let crawled = await db.select().from(crawledProblemsTable).orderBy(desc(crawledProblemsTable.crawledAt));
    if (platform) crawled = crawled.filter((c) => c.platform === platform);
    res.json(crawled.slice(parseInt(offset), parseInt(offset) + parseInt(limit)));
  } catch (err) {
    req.log.error({ err }, "crawled problems error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/crawler/import", async (req, res) => {
  try {
    const { crawledId, paymentOffer } = req.body;
    if (!crawledId || !paymentOffer) { res.status(400).json({ error: "crawledId and paymentOffer required" }); return; }
    const [crawled] = await db.select().from(crawledProblemsTable).where(eq(crawledProblemsTable.id, crawledId)).limit(1);
    if (!crawled) { res.status(404).json({ error: "Crawled problem not found" }); return; }
    await db.insert(problemsTable).values({ title: crawled.title, description: crawled.description, category: crawled.suggestedCategory, paymentOffer: String(paymentOffer), source: crawled.platform, sourceUrl: crawled.sourceUrl });
    await db.update(crawledProblemsTable).set({ isImported: true }).where(eq(crawledProblemsTable.id, crawledId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "import crawled error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
