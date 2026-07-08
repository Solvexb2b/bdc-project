---
name: Autonomous outreach engine
description: How dAIsy's 24/7 autonomous selling loop works and its constraints
---
Server-side interval engine (40s tick, re-entrancy + started guards) advances prospects through discovered→contacted→pitched→negotiating→closed_won/lost. Messages composed by gpt-5.4 with 25s timeout and persona-template fallback so autonomy never stalls if AI fails. Pricing floor: 82% of list, max 3 negotiation rounds, ~72% close rate. Persists to outreach_prospects/outreach_events; read-only public endpoints /api/outreach/{stats,prospects,events}; live UI at /outreach polling 5s.
**Constraint:** outreach is in-platform only — no real external email/calls are sent; that would require an email integration + user consent. Be transparent about this if the user asks whether real companies are being contacted.
