// Server-only wrapper around the Anthropic Messages API. Never imported
// by client code.

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Haiku 4.5 is fast + cheap and totally sufficient for short structured
// summarisation. If you want higher quality for the same shape, switch the
// model id here — nothing else in the app cares.
const MODEL = "claude-haiku-4-5-20251001";
const ENDPOINT = "https://api.anthropic.com/v1/messages";

export interface CallOpts {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callClaude(opts: CallOpts): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY missing");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 900,
      temperature: opts.temperature ?? 0.4,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { content?: Array<{ text?: string }> };
  return json.content?.[0]?.text ?? "";
}

// Extract the first JSON object/array from a model response. Handles
// markdown fences, prefix chatter, and trailing text.
export function extractJson<T>(raw: string): T | null {
  if (!raw) return null;
  // Try the naive path first.
  try {
    return JSON.parse(raw) as T;
  } catch {}
  // Strip markdown fences.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]) as T;
    } catch {}
  }
  // Find the first { … matching } by simple brace counting.
  const start = raw.indexOf("{");
  if (start >= 0) {
    let depth = 0;
    for (let i = start; i < raw.length; i++) {
      if (raw[i] === "{") depth++;
      else if (raw[i] === "}") {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(raw.slice(start, i + 1)) as T;
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
}
