import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { outreachProspects, outreachEvents } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/outreach/stats", async (_req, res) => {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${outreachProspects.stage} not in ('closed_won','closed_lost'))::int`,
      won: sql<number>`count(*) filter (where ${outreachProspects.stage} = 'closed_won')::int`,
      lost: sql<number>`count(*) filter (where ${outreachProspects.stage} = 'closed_lost')::int`,
      pipelineEth: sql<string>`coalesce(sum(${outreachProspects.proposedPriceEth}) filter (where ${outreachProspects.stage} in ('pitched','negotiating')), 0)::text`,
      closedEth: sql<string>`coalesce(sum(${outreachProspects.proposedPriceEth}) filter (where ${outreachProspects.stage} = 'closed_won'), 0)::text`,
    })
    .from(outreachProspects);
  res.json(row);
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
