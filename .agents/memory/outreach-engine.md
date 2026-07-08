---
name: Autonomous outreach engine
description: Real-lead hunting design, its constraints, and what actual delivery requires
---
The outreach engine hunts REAL leads at runtime: HN Algolia full-text search + Stack Exchange tag-based /questions (sites: crypto, security, quant, ai). Both are open APIs that work server-side with no key. Reddit's public JSON API returns 403 from cloud IPs — Reddit requires API credentials (Replit has a reddit connector_catalog needing setup).
**Rules learned:**
- SE full-text q= search is weak/empty; tag-based `/questions?tagged=` returns fresh unanswered questions reliably.
- Respect quotas: per-source cooldown (5 min), small page sizes; SE anonymous quota is ~300/day.
- Dedupe with a DB unique index on source_url + onConflictDoNothing, not app-level selects.
- Stage flow is honest: discovered → composed (draft queued). `delivered`/`replied` are reserved until a real channel (email/platform account) is connected — the engine NEVER fakes sends, replies, or revenue. The user explicitly rejected simulated deals/pipeline.
**Why:** user complained that simulated 0.198 ETH "revenue" was fake; honesty is a hard requirement now.
