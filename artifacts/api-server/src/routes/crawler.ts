import { Router } from "express";
import { db } from "@workspace/db";
import { crawledProblemsTable, problemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

const PLATFORMS = ["reddit", "quora", "stackoverflow", "hackernews"];
const CATEGORIES = ["technical", "business", "legal", "medical", "financial", "research", "general"];

function generateFakeProblem(platform: string, idx: number) {
  const titles = [
    "How to prevent memory leaks in long-running Node.js services?",
    "Best approach for distributed transaction management in microservices?",
    "Formal verification of smart contracts — tools and methodologies",
    "Reducing cold-start latency in serverless functions at scale",
    "Graph database vs relational for complex social network queries",
    "Detecting adversarial examples in production ML pipelines",
    "Zero-downtime schema migrations on tables with 500M+ rows",
    "Implementing CRDT-based conflict resolution for offline-first apps",
    "Secure multi-party computation for privacy-preserving analytics",
    "Automated remediation of SBOM vulnerabilities in CI/CD pipelines",
  ];
  return {
    externalId: `${platform}-${Date.now()}-${idx}`,
    platform,
    title: titles[idx % titles.length],
    description: `This is a high-impact problem discovered on ${platform} with significant community upvotes and engagement. The problem requires deep technical expertise and has not yet been satisfactorily resolved in public forums.`,
    sourceUrl: `https://${platform}.com/questions/${Date.now()}`,
    suggestedCategory: CATEGORIES[idx % CATEGORIES.length],
    suggestedPayment: String((Math.floor(Math.random() * 20) + 5) * 100),
    aiSummary: `High-value problem from ${platform}. Estimated ${Math.floor(Math.random() * 200) + 50} affected engineers. Core issue: architectural design gap requiring expert-level solution.`,
    upvotes: Math.floor(Math.random() * 500) + 50,
  };
}

const router = Router();

router.post("/crawler/run", async (req, res) => {
  try {
    const { platforms = PLATFORMS, category, limit = 5 } = req.body;
    const found: any[] = [];
    for (const platform of platforms.slice(0, 4)) {
      for (let i = 0; i < Math.min(limit, 3); i++) {
        const p = generateFakeProblem(platform, i);
        const [inserted] = await db.insert(crawledProblemsTable).values(p).returning();
        found.push(inserted);
      }
    }
    res.json({ found: found.length, problems: found });
  } catch (err) {
    req.log.error({ err }, "crawler run error");
    res.status(500).json({ error: "Internal server error" });
  }
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
    res.json({ success: true, message: "Problem imported successfully" });
  } catch (err) {
    req.log.error({ err }, "import crawled error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
