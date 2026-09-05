// Server-only wrapper around Exa's /search API. Never imported by client code.

export interface ExaResult {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score?: number; // Exa's own relevance score, 0..1
  text?: string; // when contents=true
  snippet?: string; // when contents=true with a snippet request
}

export interface ExaSearchOpts {
  query: string;
  numResults?: number;
  category?:
    | "company"
    | "research paper"
    | "news"
    | "pdf"
    | "github"
    | "tweet"
    | "personal site"
    | "linkedin profile"
    | "financial report";
  startPublishedDate?: string; // ISO
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  type?: "auto" | "neural" | "keyword";
}

const EXA_ENDPOINT = "https://api.exa.ai/search";

export function hasExaKey(): boolean {
  return Boolean(process.env.EXA_API_KEY);
}

export async function exaSearch(opts: ExaSearchOpts): Promise<ExaResult[]> {
  const key = process.env.EXA_API_KEY;
  if (!key) throw new Error("EXA_API_KEY missing");

  const body: Record<string, unknown> = {
    query: opts.query,
    numResults: opts.numResults ?? 10,
    type: opts.type ?? "auto",
    contents: { text: { maxCharacters: 800 } },
  };
  if (opts.category) body.category = opts.category;
  if (opts.startPublishedDate) body.startPublishedDate = opts.startPublishedDate;
  if (opts.endPublishedDate) body.endPublishedDate = opts.endPublishedDate;
  if (opts.includeDomains?.length) body.includeDomains = opts.includeDomains;
  if (opts.excludeDomains?.length) body.excludeDomains = opts.excludeDomains;

  const res = await fetch(EXA_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify(body),
    // Exa is fast; give it a generous timeout headroom for cold networks.
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Exa ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { results?: ExaResult[] };
  return json.results ?? [];
}
