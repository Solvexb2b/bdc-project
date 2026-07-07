import { Router } from "express";
import { collapseAll } from "../lib/kinetic";

const router = Router();

router.post("/kinetic/collapse-all", async (req, res) => {
  try {
    req.log.warn("KINETIC: bulk collapse-all requested");
    const result = await collapseAll();
    res.json({ success: true, ...result });
  } catch (err: any) {
    req.log.error({ err }, "kinetic/collapse-all error");
    res.status(500).json({ error: err.message });
  }
});

export default router;
