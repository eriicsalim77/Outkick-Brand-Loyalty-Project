// Keyword bank used to classify raw Exa results against tracked concepts.
// Order does not matter; matches are case-insensitive, word-boundary aware.
export const CONCEPT_KEYWORDS: Record<string, string[]> = {
  llm: ["llm", "large language model", "gpt-5", "gpt-4", "claude opus", "claude sonnet", "gemini", "llama"],
  inference: ["inference", "token/s", "tps", "latency", "throughput", "kv cache"],
  embeddings: ["embedding", "embeddings", "vector representation"],
  rag: ["rag", "retrieval-augmented", "retrieval augmented"],
  "tool-calling": ["tool call", "tool calling", "function calling", "tools api"],
  agents: ["agent", "agents", "agentic", "multi-agent", "autonomous"],
  mcp: ["mcp", "model context protocol"],
  "mcp-server": ["mcp server", "mcp servers"],
  "prompt-caching": ["prompt cache", "prompt caching", "cache_control"],
  "vector-db": ["vector db", "vector database", "pinecone", "weaviate", "qdrant", "chroma"],
  api: ["api", " sdk ", "rest api", "http api"],
  sdk: ["sdk", "typescript sdk", "python sdk"],
  webhook: ["webhook", "webhooks"],
  crm: ["salesforce", "hubspot", "crm"],
  "gtm-tooling": ["gtm", "outbound", "prospecting", "enrichment", "clay"],
  "workflow-automation": ["workflow", "automation", "zapier", "n8n", "make.com"],
  "data-warehouse": ["snowflake", "bigquery", "databricks", "data warehouse"],
  "reverse-etl": ["reverse etl", "census", "hightouch"],
  eval: ["eval", "evals", "evaluation", "benchmark"],
  "computer-use": ["computer use", "computer-use", "operator", "screen control"],
};

// Domain weight — high-signal primary sources score higher.
export const DOMAIN_WEIGHT: Record<string, number> = {
  "anthropic.com": 1.0,
  "openai.com": 1.0,
  "deepmind.google": 0.95,
  "ai.google.dev": 0.95,
  "developers.googleblog.com": 0.9,
  "blog.google": 0.85,
  "aws.amazon.com": 0.9,
  "azure.microsoft.com": 0.9,
  "salesforce.com": 0.9,
  "hubspot.com": 0.85,
  "snowflake.com": 0.85,
  "databricks.com": 0.85,
  "clay.com": 0.8,
  "cursor.com": 0.8,
  "modelcontextprotocol.io": 0.95,
  "huggingface.co": 0.85,
  "github.com": 0.75,
  "techcrunch.com": 0.6,
  "theverge.com": 0.6,
  "arstechnica.com": 0.65,
  "news.ycombinator.com": 0.7,
  "x.com": 0.55,
  "twitter.com": 0.55,
  "reddit.com": 0.5,
  "medium.com": 0.4,
  "substack.com": 0.5,
};

export function weightForUrl(url: string): number {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    // exact match first
    if (DOMAIN_WEIGHT[host]) return DOMAIN_WEIGHT[host];
    // suffix match (blog.anthropic.com → anthropic.com)
    for (const domain of Object.keys(DOMAIN_WEIGHT)) {
      if (host.endsWith("." + domain)) return DOMAIN_WEIGHT[domain];
    }
    return 0.45;
  } catch {
    return 0.4;
  }
}
