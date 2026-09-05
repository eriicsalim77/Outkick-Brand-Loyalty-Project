import type { TrendingItem } from "@/lib/types";

// Used when EXA_API_KEY is not set, so the dashboard still has a Trending
// section that isn't just the seeded signal list.
export const TRENDING_FALLBACK: TrendingItem[] = [
  {
    id: "t-anthropic-agent-skills",
    title: "Anthropic ships Agent Skills for Claude",
    snippet:
      "A packaging format for reusable model behaviours — skills bundle instructions, examples, and tools that a Claude agent can compose on demand.",
    url: "https://www.anthropic.com/news",
    publisher: "Anthropic",
    publishedAt: isoDaysAgo(2),
    technologies: ["agents", "tool-calling", "mcp"],
    momentum: 92,
    tier: 1,
  },
  {
    id: "t-openai-realtime-ga",
    title: "OpenAI Realtime API hits general availability",
    snippet:
      "The speech-to-speech WebSocket API graduates from beta, with new tool call primitives and a pricing update.",
    url: "https://openai.com/index/introducing-the-realtime-api/",
    publisher: "OpenAI",
    publishedAt: isoDaysAgo(5),
    technologies: ["inference", "tool-calling", "api"],
    momentum: 88,
    tier: 1,
  },
  {
    id: "t-clay-agents-v2",
    title: "Clay expands agent enrichment across the open web",
    snippet:
      "Clay's agents now compose scraper + provider + LLM steps for account-level research, aimed at replacing manual SDR prep.",
    url: "https://www.clay.com/",
    publisher: "Clay",
    publishedAt: isoDaysAgo(4),
    technologies: ["agents", "gtm-tooling", "workflow-automation"],
    momentum: 82,
    tier: 1,
  },
  {
    id: "t-mcp-registry",
    title: "The MCP ecosystem crosses 1,000 servers",
    snippet:
      "An updated registry counts more than a thousand MCP servers spanning developer tools, CRM, warehouses, and internal ops.",
    url: "https://modelcontextprotocol.io/",
    publisher: "modelcontextprotocol.io",
    publishedAt: isoDaysAgo(3),
    technologies: ["mcp", "mcp-server"],
    momentum: 80,
    tier: 1,
  },
  {
    id: "t-agentforce-2",
    title: "Salesforce ships Agentforce 2 with deeper Data Cloud grounding",
    snippet:
      "New action library, better guardrails, and native handoff between service and sales agents inside Salesforce.",
    url: "https://www.salesforce.com/agentforce/",
    publisher: "Salesforce",
    publishedAt: isoDaysAgo(6),
    technologies: ["agents", "crm", "workflow-automation"],
    momentum: 76,
    tier: 1,
  },
  {
    id: "t-anthropic-prompt-cache-ga",
    title: "Prompt Caching on the Claude API now generally available",
    snippet:
      "Anthropic moves Prompt Caching to GA with expanded model coverage and clearer billing telemetry.",
    url: "https://www.anthropic.com/news/prompt-caching",
    publisher: "Anthropic",
    publishedAt: isoDaysAgo(7),
    technologies: ["prompt-caching", "inference", "api"],
    momentum: 72,
    tier: 1,
  },
  {
    id: "t-cursor-agents",
    title: "Cursor ships background agents for long-running tasks",
    snippet:
      "Cursor introduces background agents that run in a sandboxed environment and open PRs when finished, targeting engineering teams.",
    url: "https://www.cursor.com/",
    publisher: "Cursor",
    publishedAt: isoDaysAgo(9),
    technologies: ["agents", "tool-calling"],
    momentum: 68,
    tier: 1,
  },
  {
    id: "t-snowflake-cortex-agents",
    title: "Snowflake extends Cortex with agent-shaped SQL functions",
    snippet:
      "New Cortex primitives let agents call SQL functions and query warehouse data without leaving the Snowflake perimeter.",
    url: "https://www.snowflake.com/en/data-cloud/cortex/",
    publisher: "Snowflake",
    publishedAt: isoDaysAgo(10),
    technologies: ["agents", "rag", "data-warehouse"],
    momentum: 65,
    tier: 1,
  },
];

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
