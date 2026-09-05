# Signal

Personalised technology learning for GTM, RevOps, and FDE roles.

Signal watches the developments that matter to your role, filters the noise,
and turns the two or three you actually need to understand into short,
structured lessons — each ending with a quiz that updates your knowledge
map. It also pulls **live trending items** from the web (via Exa) and
composes a **prerequisite-aware roadmap** of what to learn next.

## Run it locally

```bash
cd signal
npm install
npm run dev
```

Open http://localhost:3000.

Optional: `.env.local` accepts two keys, both graceful.

- `EXA_API_KEY` — pulls live Trending items from the web. Without it,
  Trending falls back to a curated set.
- `ANTHROPIC_API_KEY` — Claude Haiku 4.5 writes each live signal's
  "why this matters" and its short learning card. Without it, both
  fall back to templated copy keyed off the inferred concepts.

```bash
cp .env.example .env.local
# then edit .env.local
```

## The three home sections

1. **Today's Pick** — the one signal, ranked P1 for you, that we think you
   should actually understand today. Plus a small row of secondary picks.
2. **Trending in your world** — the top developments from the web (up to 8
   for Pro, 3 for Free), each turned into a personalised **learning card**:
   a P1/P2/P3 tag scored *for your role*, a plain-language "why this matters
   to you", a short "what is it" explainer, 3 key takeaways, and one concrete
   "apply it" prompt. Rendered on a dedicated `/live/[id]` page. Written by
   Claude Haiku 4.5 when `ANTHROPIC_API_KEY` is set, or by templates otherwise.
   Ranked by momentum (recency + primary-source weight + Exa's relevance).
   Refreshes on demand; cached server-side for 15 minutes.
3. **Your Roadmap** — the next 3 concepts to learn, ordered by prerequisite
   depth and boosted by (a) what you flagged as "want to learn" and (b)
   which concepts today's P1 signals touch. Every item links to the lesson
   that teaches it.

## Knowledge map

`/knowledge` now renders a real DAG:

- Nodes = concepts, sized by your current mastery, coloured by status
  (strong / developing / needs attention / not started).
- Edges = prerequisite relationships, so you can see the path to any concept.
- Hover a node for the definition; click one that has a lesson to open it.

Layout is a hand-rolled layered graph: `lib/graphLayout.ts` assigns each
concept a layer by topological rank, then reorders within each layer to
reduce edge crossings.

## Exa integration

The Trending section is powered by `app/api/trending/route.ts`, which:

- Fires several role-tuned queries at Exa's `/search` endpoint in parallel.
- Runs each result through `lib/ingest.ts`:
  - Keyword-classifies the title + snippet + text against the concept graph
    (`data/keywords.ts`).
  - Discards results that don't touch a tracked concept.
  - Scores each with a momentum blend: 45% recency, 40% source-domain
    weight, 15% Exa's own relevance score.
- Dedupes and returns the top 5.

If `EXA_API_KEY` is missing, or Exa returns nothing classifiable, the route
returns a hand-authored fallback (`data/trendingFallback.ts`) instead. The
UI shows which source it's on.

Cache is in-memory, per role, with a 15-minute TTL. `?refresh=1` bypasses
the cache.

## Project layout

```
signal/
  app/
    page.tsx                    Landing
    onboarding/                 Role, industry, level, goal, interests
    dashboard/                  Today's Pick / Trending / Roadmap
    signals/[id]/               Signal detail + primary source
    lessons/[id]/               Interactive lesson + quiz
    knowledge/                  Visual DAG map + full roadmap
    api/trending/route.ts       Exa-backed trending, with fallback
  components/
    KnowledgeGraph.tsx          SVG-based layered DAG
    TrendingList.tsx            Live-ranked list, refresh + source indicator
    RoadmapCard.tsx             Prereq-ordered next-3 concepts
    ...
  lib/
    types.ts                    Domain types
    prioritize.ts               P1/P2/P3 scoring against a profile
    knowledge.ts                Concept progress + status buckets
    roadmap.ts                  Prereq-aware "next best" ordering
    graphLayout.ts              Layered DAG layout for the knowledge map
    exa.ts                      Server-only Exa client
    ingest.ts                   Raw Exa results -> classified TrendingItems
    storage.ts                  localStorage adapters
  data/
    concepts.ts                 Tracked concepts with prerequisite edges
    keywords.ts                 Concept keywords + domain weights
    signals.ts                  Curated primary-source signals
    lessons.ts                  Authored lessons + role copy + quizzes
    trendingFallback.ts         Fallback trending set when Exa is off
```

## How personalisation works

Every signal carries an authored `relevance` block per role (a numeric
score and a one-line "why this matters to you" written for that role). At
runtime `lib/prioritize.ts` combines that with the user's industry match,
wanted technologies, and current knowledge gaps to produce a final
P1 / P2 / P3 tag plus a written reason.

Lessons update per-concept confidence scores via `lib/knowledge.ts`, and
the concept graph in `data/concepts.ts` lets both the knowledge map and
the roadmap suggest the right prerequisite next — Tool Calling before MCP,
Embeddings before RAG.

## Freemium (Pro tier)

The UI + gating layer for the paywall is in place. The RevenueCat Web SDK
is **not** wired yet — you asked for UI-only for now — but every gate in the
app reads through a single entitlement module so the swap is one file.

### What Pro unlocks

- Full Trending feed (Free = top 3, Pro = full ranked list of 8).
- Deeper roadmap (planned — currently both tiers see next 3).
- Faster refresh cadence on Trending (planned).
- Export briefings (planned).

### How the gate works today

- `lib/entitlements.ts` — `isPro()`, `grantPro()`, `revokePro()`,
  `useIsPro()` hook. Reads a `signal.entitlement.pro.v1` flag in
  localStorage. Every gate goes through this — no other file touches the
  flag directly.
- `/upgrade` — pricing page with a **dev-only** simulate-purchase button
  that flips the flag. Also has "Force Pro on / off" for testing.
- `Nav` shows an **Upgrade** chip for free users and a **Pro** chip for
  Pro users.
- `TrendingList` shows the first 3 items to free users, then a blurred
  preview of the rest with an Upgrade CTA.

### Swapping in RevenueCat (later, ~an afternoon)

1. `npm install @revenuecat/purchases-js`
2. Create a RevenueCat project → Web Billing app → one entitlement `pro`
   → one product `pro_monthly` (linked to the entitlement).
3. Drop the Web Billing public key into `.env.local`
   (`NEXT_PUBLIC_RC_WEB_KEY=rcb_...`).
4. In `lib/entitlements.ts`:
   ```ts
   import { Purchases } from "@revenuecat/purchases-js";
   // configure once on the client, using getOrCreateAppUserId() as the id
   // isPro() -> Purchases.getSharedInstance().getCustomerInfo() -> entitlements.active["pro"] != null
   ```
5. In `/upgrade`, replace `grantPro()` with
   `Purchases.getSharedInstance().purchase({ packageIdentifier: "pro_monthly" })`.

Nothing else in the app changes — `useIsPro()` still drives every gate.
When you add real auth later, call `Purchases.getSharedInstance().logIn(realUserId)`
to migrate entitlements from the anonymous id.

## What's next (open threads)

- **RevenueCat wiring** — see above; needs RC + Stripe accounts.
- **Auth** — Supabase / Clerk / your choice; slot it in where
  `getOrCreateAppUserId()` lives so entitlements migrate on `logIn()`.
- **LLM summarisation** of Exa results for a nicer "why this matters" on
  live items. `lib/ingest.ts` is the single hook.
- **Personalised trending** — fold the user's `wantsToLearn` list into the
  Exa query set, not just the role.
