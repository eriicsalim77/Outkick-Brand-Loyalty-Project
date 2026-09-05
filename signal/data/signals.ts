import type { Signal } from "@/lib/types";

// Curated, plausible signals grounded in real primary sources.
// Dates are illustrative and set relative to a recent time window.
export const SIGNALS: Signal[] = [
  {
    id: "mcp-open-protocol",
    title: "Anthropic open-sources the Model Context Protocol (MCP)",
    summary:
      "MCP is an open protocol for connecting LLM applications to external tools and data sources. Reference servers, an SDK, and integrations with several developer tools shipped alongside the spec.",
    category: "AI Infrastructure",
    technologies: ["mcp", "mcp-server", "tool-calling", "agents"],
    source: {
      publisher: "Anthropic",
      url: "https://www.anthropic.com/news/model-context-protocol",
      tier: 1,
      publishedAt: "2024-11-25",
      label: "Official announcement",
    },
    minutesToRead: 5,
    industries: ["ai", "devtools", "saas"],
    base: { novelty: 92, velocity: 88 },
    relevance: {
      gtm: {
        score: 88,
        reason:
          "Buyers building agentic workflows will ask how your product plugs into an MCP-based stack. Speaking to this credibly is table stakes in AI-adjacent deals.",
      },
      revops: {
        score: 72,
        reason:
          "MCP is likely to become the way agents reach CRM and enrichment tools. Understanding it early shapes how you evaluate agent-enabled RevOps vendors.",
      },
      fde: {
        score: 95,
        reason:
          "Customers implementing agents will want your product exposed as an MCP server. You should be able to sketch the integration in a whiteboard session.",
      },
    },
  },
  {
    id: "claude-computer-use",
    title: "Anthropic ships Computer Use for Claude",
    summary:
      "Claude can now operate a computer directly — moving the cursor, clicking, typing, and reading the screen — through a new API capability aimed at agentic workflows.",
    category: "AI Agents",
    technologies: ["computer-use", "agents", "tool-calling"],
    source: {
      publisher: "Anthropic",
      url: "https://www.anthropic.com/news/3-5-models-and-computer-use",
      tier: 1,
      publishedAt: "2024-10-22",
      label: "Official announcement",
    },
    minutesToRead: 6,
    industries: ["ai", "saas", "devtools"],
    base: { novelty: 90, velocity: 70 },
    relevance: {
      gtm: {
        score: 78,
        reason:
          "This changes what customers imagine an AI can automate. Expect prospects to ask whether your product supports being driven by an AI operator.",
      },
      revops: {
        score: 82,
        reason:
          "Legacy tools without APIs can now be automated by an agent that drives the UI. That reshapes build-vs-buy for internal RevOps workflows.",
      },
      fde: {
        score: 90,
        reason:
          "A new implementation pattern to evaluate: when to use screen control vs a proper API integration. Cost, reliability, and safety envelopes matter.",
      },
    },
  },
  {
    id: "openai-realtime-api",
    title: "OpenAI ships a Realtime API for low-latency voice",
    summary:
      "A WebSocket-based API delivers speech-to-speech interactions with sub-second latency, tool calling, and streaming audio — collapsing the traditional STT → LLM → TTS pipeline.",
    category: "AI Infrastructure",
    technologies: ["inference", "tool-calling", "api"],
    source: {
      publisher: "OpenAI",
      url: "https://openai.com/index/introducing-the-realtime-api/",
      tier: 1,
      publishedAt: "2024-10-01",
      label: "Official announcement",
    },
    minutesToRead: 5,
    industries: ["ai", "saas"],
    base: { novelty: 82, velocity: 76 },
    relevance: {
      gtm: {
        score: 74,
        reason:
          "Voice AI moves from novelty to production. Any prospect running a phone channel — support, sales dev, scheduling — will now benchmark against realtime voice.",
      },
      revops: {
        score: 68,
        reason:
          "Voice agents on outbound and qualification are becoming viable. Worth pressure-testing your call routing, disposition, and CRM logging for AI callers.",
      },
      fde: {
        score: 84,
        reason:
          "New integration pattern with real constraints: streaming audio, barge-in, tool calls mid-utterance. Reference architectures are still being written.",
      },
    },
  },
  {
    id: "anthropic-prompt-caching",
    title: "Anthropic launches Prompt Caching on the Claude API",
    summary:
      "Prompt Caching lets an API caller reuse computed context across requests, cutting cost by up to 90% and latency by up to 85% for prompts with a long, repeated prefix.",
    category: "AI Infrastructure",
    technologies: ["prompt-caching", "inference", "api"],
    source: {
      publisher: "Anthropic",
      url: "https://www.anthropic.com/news/prompt-caching",
      tier: 1,
      publishedAt: "2024-08-14",
      label: "Official announcement",
    },
    minutesToRead: 4,
    industries: ["ai", "devtools", "saas"],
    base: { novelty: 70, velocity: 82 },
    relevance: {
      gtm: {
        score: 60,
        reason:
          "Changes the unit economics of AI features. A useful data point when a prospect pushes back on token-cost concerns for a heavy-context product.",
      },
      revops: {
        score: 55,
        reason:
          "If your team builds internal AI tools on the Claude API, this is a lever to make agents on long context (playbooks, account briefs) affordable.",
      },
      fde: {
        score: 90,
        reason:
          "A first-class tool for making long-context prompts affordable. Redesign your prompts so shared context sits at the front and gets cached.",
      },
    },
  },
  {
    id: "openai-agents-sdk",
    title: "OpenAI releases an Agents SDK and Responses API",
    summary:
      "A new SDK and API surface aimed at multi-step agentic apps: built-in tool loops, handoffs between agents, tracing, and evals.",
    category: "AI Agents",
    technologies: ["agents", "tool-calling", "sdk", "api", "eval"],
    source: {
      publisher: "OpenAI",
      url: "https://openai.com/index/new-tools-for-building-agents/",
      tier: 1,
      publishedAt: "2025-03-11",
      label: "Official announcement",
    },
    minutesToRead: 6,
    industries: ["ai", "devtools"],
    base: { novelty: 78, velocity: 80 },
    relevance: {
      gtm: {
        score: 70,
        reason:
          "Every AI-first buyer is choosing an agent stack this year. Know what OpenAI's opinion is so you can position your product against it.",
      },
      revops: {
        score: 65,
        reason:
          "Internal RevOps agents (research, enrichment, drafting) are getting easier to build. Understand the SDK to have an informed opinion on build-vs-buy.",
      },
      fde: {
        score: 88,
        reason:
          "A new mainline framework to evaluate for customer implementations. Learn its abstractions (tools, handoffs, tracing) and their tradeoffs vs. rolling your own.",
      },
    },
  },
  {
    id: "gpt-5-launch",
    title: "OpenAI announces GPT-5",
    summary:
      "OpenAI positions GPT-5 as a unified model spanning fast responses and deeper reasoning, with routing between modes handled behind a single API surface.",
    category: "AI Models",
    technologies: ["llm", "inference"],
    source: {
      publisher: "OpenAI",
      url: "https://openai.com/index/introducing-gpt-5/",
      tier: 1,
      publishedAt: "2025-08-07",
      label: "Official announcement",
    },
    minutesToRead: 4,
    industries: ["ai", "saas", "devtools"],
    base: { novelty: 88, velocity: 92 },
    relevance: {
      gtm: {
        score: 82,
        reason:
          "Frontier-model launches shift customer expectations of what's possible. Expect competitive questions on which models you support and why.",
      },
      revops: {
        score: 70,
        reason:
          "Model routing under a single API changes vendor-selection conversations for RevOps AI tooling — capability is less about naming a specific model.",
      },
      fde: {
        score: 86,
        reason:
          "New pricing, latency, and reasoning envelope. Re-benchmark your reference architectures — routing decisions and cost floors may change.",
      },
    },
  },
  {
    id: "salesforce-agentforce",
    title: "Salesforce ships Agentforce for autonomous CRM agents",
    summary:
      "Agentforce lets teams build and deploy autonomous agents on Salesforce data with a low-code builder, guardrails, and native access to CRM records and flows.",
    category: "GTM Tooling",
    technologies: ["agents", "crm", "workflow-automation", "tool-calling"],
    source: {
      publisher: "Salesforce",
      url: "https://www.salesforce.com/agentforce/",
      tier: 1,
      publishedAt: "2024-09-12",
      label: "Official product page",
    },
    minutesToRead: 5,
    industries: ["saas", "ai"],
    base: { novelty: 80, velocity: 78 },
    relevance: {
      gtm: {
        score: 84,
        reason:
          "Your CRM-centric buyers are being pitched Agentforce today. Know its shape well enough to position where you fit alongside or against it.",
      },
      revops: {
        score: 94,
        reason:
          "This is a direct change in the tooling you own. Decide where Agentforce replaces custom flows, where it doesn't, and how it interacts with your data stack.",
      },
      fde: {
        score: 76,
        reason:
          "Customers running on Salesforce will expect your product to plug in alongside Agentforce. Understand the actions/topics model to design that integration.",
      },
    },
  },
  {
    id: "hubspot-breeze",
    title: "HubSpot introduces Breeze AI agents",
    summary:
      "Breeze bundles AI copilots and role-specific agents (content, prospecting, customer) directly into the HubSpot suite, with access to CRM data and workflows.",
    category: "GTM Tooling",
    technologies: ["agents", "crm", "workflow-automation"],
    source: {
      publisher: "HubSpot",
      url: "https://www.hubspot.com/products/artificial-intelligence",
      tier: 1,
      publishedAt: "2024-09-18",
      label: "Official product page",
    },
    minutesToRead: 4,
    industries: ["saas"],
    base: { novelty: 70, velocity: 74 },
    relevance: {
      gtm: {
        score: 76,
        reason:
          "Down-market and mid-market buyers now get AI baked into HubSpot. Know how it compares to the AI you sell so you can qualify quickly.",
      },
      revops: {
        score: 82,
        reason:
          "If your org runs on HubSpot, Breeze is a build-vs-buy input on prospecting, content, and support automations you may have planned to build.",
      },
      fde: {
        score: 60,
        reason:
          "Awareness-level for engineering. Relevant when a customer's HubSpot instance is part of the reference architecture you're proposing.",
      },
    },
  },
  {
    id: "clay-agents",
    title: "Clay ships agent-based enrichment for GTM data",
    summary:
      "Clay expands its enrichment platform with AI agents that research accounts and people using the open web, structured providers, and custom prompts.",
    category: "GTM Tooling",
    technologies: ["agents", "gtm-tooling", "workflow-automation"],
    source: {
      publisher: "Clay",
      url: "https://www.clay.com/",
      tier: 1,
      publishedAt: "2024-10-05",
      label: "Official product",
    },
    minutesToRead: 4,
    industries: ["saas"],
    base: { novelty: 72, velocity: 84 },
    relevance: {
      gtm: {
        score: 74,
        reason:
          "Your reps and their competitors are using Clay to research prospects. Understanding it sharpens your account plans and outbound cadences.",
      },
      revops: {
        score: 92,
        reason:
          "Clay is displacing whole stretches of the enrichment stack. Own the decision on where Clay fits vs. traditional enrichment tools and Reverse ETL.",
      },
      fde: {
        score: 55,
        reason:
          "Context for RevOps-adjacent conversations. Less immediately relevant to the architectures you deploy for customers.",
      },
    },
  },
  {
    id: "cursor-composer",
    title: "Cursor adds multi-file editing with Composer",
    summary:
      "Cursor introduces Composer, a multi-file editing surface driven by an agent that can plan, edit across files, and run terminals inside the IDE.",
    category: "Developer Tools",
    technologies: ["agents", "tool-calling"],
    source: {
      publisher: "Cursor",
      url: "https://www.cursor.com/",
      tier: 1,
      publishedAt: "2024-10-30",
      label: "Official product",
    },
    minutesToRead: 3,
    industries: ["devtools", "ai"],
    base: { novelty: 68, velocity: 78 },
    relevance: {
      gtm: {
        score: 40,
        reason:
          "Awareness. Useful color when talking to developer-facing buyers about how AI is changing their workflows.",
      },
      revops: {
        score: 30,
        reason:
          "Low direct relevance. Interesting as an example of what agent-driven UX in production looks like.",
      },
      fde: {
        score: 78,
        reason:
          "Changes how you and your customer's engineers ship code. Worth a real trial to know when to recommend it in a customer engagement.",
      },
    },
  },
  {
    id: "snowflake-cortex",
    title: "Snowflake ships Cortex AI functions",
    summary:
      "Cortex adds LLM, embedding, and retrieval SQL functions running inside Snowflake, so warehouse users can query and generate against models without leaving the platform.",
    category: "Data Infrastructure",
    technologies: ["llm", "embeddings", "rag", "data-warehouse"],
    source: {
      publisher: "Snowflake",
      url: "https://www.snowflake.com/en/data-cloud/cortex/",
      tier: 1,
      publishedAt: "2024-06-04",
      label: "Official product page",
    },
    minutesToRead: 5,
    industries: ["ai", "saas"],
    base: { novelty: 72, velocity: 68 },
    relevance: {
      gtm: {
        score: 55,
        reason:
          "Useful color for enterprise conversations. Data-team buyers may bring up Cortex when evaluating anything AI-adjacent.",
      },
      revops: {
        score: 78,
        reason:
          "If your analytics stack lives in Snowflake, Cortex is a real path to AI-enriched pipelines without new infrastructure to own.",
      },
      fde: {
        score: 74,
        reason:
          "A meaningful reference architecture pattern: keep data in the warehouse, call models via SQL. Know when this beats a separate RAG stack.",
      },
    },
  },
];

export const SIGNALS_BY_ID: Record<string, Signal> = Object.fromEntries(
  SIGNALS.map((s) => [s.id, s]),
);
