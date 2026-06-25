import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/auth/me", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      res.json(null);
      return;
    }
    const [user] = await db.select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    res.json(user ?? null);
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    (req.session as any)?.destroy?.();
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    req.log.error({ err }, "Logout error");
    res.json({ success: true, message: "Logged out" });
  }
});

router.get("/auth/login", (_req, res) => {
  res.redirect("/?login=1");
});

export default router;
