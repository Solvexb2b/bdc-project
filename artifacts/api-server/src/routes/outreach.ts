import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { outreachProspects, outreachEvents } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/outreach/stats", async (_req, res) => {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      newLeads: sql<number>`count(*) filter (where ${outreachProspects.stage} = 'discovered')::int`,
      draftsReady: sql<number>`count(*) filter (where ${outreachProspects.stage} = 'composed')::int`,
      delivered: sql<number>`count(*) filter (where ${outreachProspects.stage} = 'delivered')::int`,
      replies: sql<number>`count(*) filter (where ${outreachProspects.stage} = 'replied')::int`,
      unanswered: sql<number>`count(*) filter (where ${outreachProspects.unanswered})::int`,
    })
    .from(outreachProspects);
  res.json({ ...row, channelConnected: false });
});

router.get("/outreach/prospects", async (_req, res) => {
  const rows = await db
    .select()
    .from(outreachProspects)
    .orderBy(desc(outreachProspects.updatedAt))
    .limit(60);
  res.json(rows);
});

router.get("/outreach/events", async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "40"), 10) || 40, 200);
  const rows = await db
    .select()
    .from(outreachEvents)
    .orderBy(desc(outreachEvents.createdAt))
    .limit(limit);
  res.json(rows);
});

export default router;
