# Signal

Personalised technology learning for GTM, RevOps, and FDE roles.

Signal watches the developments that matter to your role, filters the noise,
and turns the two or three you actually need to understand into short,
structured lessons — each ending with a quiz that updates your knowledge map.

## Run it locally

```bash
cd signal
npm install
npm run dev
```

Open http://localhost:3000.

## What's in the MVP

- **Onboarding** — role (GTM / RevOps / FDE), industry, technical level, goal,
  and initial knowledge/interest tagging. Persisted in `localStorage`.
- **Personalised dashboard** — today's signals scored P1 / P2 / P3 against
  your profile, with a hero P1 card and a "next best thing to learn"
  recommendation driven by the concept graph.
- **Signal detail** — the plain-language what/why, a personalised
  "why this matters to you" written for your role, and a link to the primary
  source (Anthropic, OpenAI, Salesforce, HubSpot, Snowflake, Clay, Cursor…).
- **Lessons** — a 6-step interactive lesson per signal
  (what happened → what is it → why it matters → how it works →
  key takeaways → apply → quiz), with role-specific "why" and "apply" copy.
- **Knowledge map** — every concept the app tracks, grouped by category,
  with confidence scores and prerequisite chains.

## Project layout

```
signal/
  app/                     Next.js App Router pages
    page.tsx               Landing
    onboarding/            Role, industry, level, goal, interests
    dashboard/             Today's signals + next-best-thing-to-learn
    signals/[id]/          Signal detail + primary source
    lessons/[id]/          Interactive lesson + quiz
    knowledge/             Knowledge map
  components/              UI building blocks
  lib/
    types.ts               Core domain types
    prioritize.ts          Priority scoring against a profile
    knowledge.ts           Concept progress, prereq-aware "next best"
    storage.ts             localStorage adapters
  data/
    concepts.ts            Tracked concepts and prerequisite edges
    signals.ts             Seeded signals grounded in real primary sources
    lessons.ts             Authored lessons + role-specific copy + quizzes
```

## How the personalisation works

Every signal carries an authored `relevance` block per role (a numeric score
and a one-line "why this matters to you" written for that role). At runtime
`lib/prioritize.ts` combines that with the user's industry match, wanted
technologies, and current knowledge gaps to produce a final P1 / P2 / P3
tag plus a written reason.

Lessons update per-concept confidence scores via `lib/knowledge.ts`, and the
concept graph in `data/concepts.ts` lets the dashboard suggest the right
prerequisite next — Tool Calling before MCP, Embeddings before RAG.

## Adding a new signal

1. Add an entry to `data/signals.ts` with a real primary source URL and per-role
   `relevance` copy.
2. If it deserves a lesson, add an entry with the same id to `data/lessons.ts`
   with the six sections, role-specific `whyItMatters` and `apply` copy, and
   quiz questions tagged with the concept they probe.
3. Any new concepts referenced should be added to `data/concepts.ts` with
   their prerequisites — that keeps the "next best thing to learn"
   recommendation coherent.
