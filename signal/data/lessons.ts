import type { Lesson } from "@/lib/types";

export const LESSONS: Lesson[] = [
  {
    id: "mcp-open-protocol",
    signalId: "mcp-open-protocol",
    primaryConceptId: "mcp",
    conceptsTaught: ["tool-calling", "mcp", "mcp-server"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "Anthropic published an open specification called the Model Context Protocol (MCP) along with reference server implementations and an SDK. Several developer tools shipped MCP support the same day.\n\nMCP is deliberately vendor-neutral. Any LLM app that speaks MCP can connect to any tool or data source that exposes an MCP server — the same way any browser can hit any HTTP endpoint.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "MCP is a small protocol that standardises three things between an AI application (the client) and a system that exposes data or actions (the server):\n\n1. Tools — functions the model can call.\n2. Resources — read-only data the model can pull in as context.\n3. Prompts — pre-built prompt templates a server can offer.\n\nInstead of every AI app writing bespoke integrations for every data source, both sides implement MCP and talk to each other.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Your customers are deciding what their agent stack looks like. Whether you sell CRM, data, security, or infrastructure, buyers will start asking the same question: 'is this MCP-compatible?'\n\nBeing able to answer confidently — and to say what an MCP server for your product would expose — moves deals forward.",
        },
        revops: {
          heading: "Why this matters",
          body: "MCP is going to be the way agents reach your CRM, warehouse, and enrichment tools. That reshapes vendor selection: instead of asking 'does this vendor have an integration?' you'll ask 'does this vendor expose an MCP server, and what does it expose?'\n\nIt also lowers the cost of connecting internal AI copilots to your operational data.",
        },
        fde: {
          heading: "Why this matters",
          body: "You'll be asked to design MCP-based architectures — either exposing your product as a server or wiring it into a client. Understanding the protocol lets you sketch the integration in a whiteboard session and cut days of discovery.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "The client (an LLM app) speaks MCP over stdio or HTTP to one or more servers.\n\nThe server registers its tools, resources, and prompts. When the LLM decides it wants to call a tool, the client forwards that call to the server, receives the result, and hands it back to the model.\n\nBecause the protocol is standardised, a single client can connect to dozens of servers with no bespoke code, and a single server is usable from any compliant client.",
      },
      keyTakeaways: [
        "MCP is an open protocol, not a product.",
        "Servers expose tools, resources, and prompts.",
        "Any MCP client can talk to any MCP server.",
        "It reduces the N × M integration problem for AI apps and data sources.",
        "Expect 'MCP server for X' to become a standard checklist item.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "A prospect on a discovery call says: 'we're standardising on MCP for our internal agents — is your product compatible?'\n\nAim to answer three things: (1) whether an MCP server exists or is on the roadmap, (2) what actions and data it would expose, (3) how customers control auth and permissions. Then bring the FDE in for the deep dive.",
        },
        revops: {
          heading: "Apply it",
          body: "Pick one internal workflow — for example, an agent that reads a rep's account brief and updates CRM fields. Sketch which systems it would need to reach, whether each already has an MCP server, and where you'd have to build one.",
        },
        fde: {
          heading: "Apply it",
          body: "A customer wants to build an internal AI assistant that can query their warehouse and open Salesforce cases. Sketch the architecture: which MCP servers you'd use, which you'd have to build, and where you'd enforce permissions between the client, the servers, and the underlying systems.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "What problem is MCP designed to solve?",
          choices: [
            "Fine-tuning LLMs on private data",
            "Standardising how AI apps connect to external tools and data",
            "Speeding up inference for very long prompts",
            "Ranking search results with embeddings",
          ],
          correctIndex: 1,
          explanation:
            "MCP replaces bespoke per-integration wiring with a single protocol both sides implement.",
          conceptId: "mcp",
        },
        {
          id: "q2",
          prompt: "Which of these does an MCP server expose to a client?",
          choices: [
            "Only tools (callable functions)",
            "Only resources (read-only data)",
            "Tools, resources, and prompts",
            "Model weights and training data",
          ],
          correctIndex: 2,
          explanation:
            "The spec covers three primitives: tools, resources, and prompt templates.",
          conceptId: "mcp",
        },
        {
          id: "q3",
          prompt: "MCP is closest in spirit to which older technology?",
          choices: [
            "GraphQL — a query language",
            "OAuth — an authorization protocol",
            "LSP — a protocol standardising how editors talk to language servers",
            "Kubernetes — a container orchestrator",
          ],
          correctIndex: 2,
          explanation:
            "MCP is often compared to LSP: a small protocol that decouples clients from a growing ecosystem of servers.",
          conceptId: "mcp",
        },
        {
          id: "q4",
          prompt:
            "A customer says 'we don't want every AI app to have direct database credentials.' How does MCP help?",
          choices: [
            "It encrypts the model weights at rest.",
            "The server enforces auth and exposes only the operations it chooses; the client never sees underlying credentials.",
            "It bans agents from database access entirely.",
            "It compresses prompts to reduce token cost.",
          ],
          correctIndex: 1,
          explanation:
            "Servers are the trust boundary — the client only sees the tools/resources the server exposes.",
          conceptId: "mcp-server",
        },
      ],
    },
  },
  {
    id: "claude-computer-use",
    signalId: "claude-computer-use",
    primaryConceptId: "computer-use",
    conceptsTaught: ["computer-use", "agents"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "Anthropic added a Computer Use capability to the Claude API. Given a screenshot and a goal, Claude can output a series of mouse and keyboard actions to operate a computer — clicking buttons, typing into fields, and reading what's on screen.\n\nIt's a first-of-its-kind capability from a frontier model, released as a public beta with the expected safety caveats.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "Computer Use is a tool-calling loop where the tool is 'the entire computer'. Each turn, the model sees a screenshot, decides an action (move mouse to (x,y), click, type text, take screenshot again), executes it via your runner, and continues until the task is done or the goal is unreachable.\n\nIt makes previously un-automatable software — legacy apps with no API, weird internal tools — automatable by an agent that just uses the UI.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Prospects will start imagining that AI can automate anything that a person can click through. That's directionally true and will change what buyers ask of your product.\n\nExpect questions like: can your product be driven by an AI operator? Do you expose a stable enough UI or API that an agent can use it reliably?",
        },
        revops: {
          heading: "Why this matters",
          body: "Every RevOps team has a list of manual workflows blocked by 'the system has no API'. Computer Use is a real (if brittle) escape hatch. It shifts build-vs-buy math for internal automation — you can go build the workflow now, without waiting on the vendor.",
        },
        fde: {
          heading: "Why this matters",
          body: "You now have a new implementation pattern to reach for when an integration has no clean API. But you also inherit new failure modes — UI drift, race conditions, harder observability. Know when to use it and when to invest in a proper integration instead.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You run a virtual desktop (a container, a VM) that Claude can drive. The model is given the goal and, at each step, a screenshot of that desktop.\n\nClaude returns actions in a small, structured format — for example, 'move mouse to coordinates (312, 480), then left-click'. Your code executes those actions on the desktop, takes another screenshot, and sends it back.\n\nThe loop continues until Claude signals completion or asks a question. Guardrails, retries, and safety checks live in your runner.",
      },
      keyTakeaways: [
        "It's a tool-calling loop where the tool is a computer.",
        "Great for un-API'd legacy software.",
        "Failure modes are UI-driven: brittleness, drift, race conditions.",
        "Safety: sandbox the desktop; never give it credentials it doesn't need.",
        "It complements — not replaces — API-based integrations.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "A prospect asks, 'could an AI agent just use our billing system for us?' Set expectations: yes with Computer Use, but reliably only for workflows that are short, well-scoped, and don't move money without human review.",
        },
        revops: {
          heading: "Apply it",
          body: "Pick a manual workflow that's blocked by a UI-only tool. Sketch a Computer Use agent that handles the golden path. Then list the ways it can fail (UI changes, popups, MFA) and where a human should still verify.",
        },
        fde: {
          heading: "Apply it",
          body: "A customer wants to automate an internal workflow across three apps, one of which has no API. Sketch a mixed architecture: API integrations for two apps, a sandboxed Computer Use runner for the third, and a queue that reconciles results.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "Computer Use is best described as:",
          choices: [
            "A model fine-tuned on GUI screenshots",
            "A tool-calling loop where the tool is the whole desktop",
            "A replacement for API integrations everywhere",
            "A browser-only automation library",
          ],
          correctIndex: 1,
          explanation:
            "Each turn the model sees the screen and chooses an action; your runner executes it.",
        },
        {
          id: "q2",
          prompt:
            "When would you NOT reach for Computer Use as your first choice?",
          choices: [
            "The target software has a well-designed, stable API",
            "The target software is legacy and API-less",
            "You need to interact with a random third-party portal once",
            "You're prototyping to see if automation is even feasible",
          ],
          correctIndex: 0,
          explanation:
            "With a good API, direct integration is more reliable, cheaper, and easier to observe.",
        },
        {
          id: "q3",
          prompt: "Which risk is most specific to Computer Use?",
          choices: [
            "Model hallucination in generated prose",
            "UI drift breaking automations",
            "Vector database recall degradation",
            "Model context window overflow",
          ],
          correctIndex: 1,
          explanation:
            "Because it depends on the visual UI, layout changes silently break the automation.",
        },
      ],
    },
  },
  {
    id: "openai-realtime-api",
    signalId: "openai-realtime-api",
    primaryConceptId: "inference",
    conceptsTaught: ["inference", "tool-calling"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "OpenAI released a Realtime API that streams audio in and out over a WebSocket, with sub-second latency and native tool calling. It collapses the old speech-to-text → LLM → text-to-speech pipeline into a single connection.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "A bidirectional audio API. You send microphone audio, the model streams back synthesised speech, and you can hand it tools it can call mid-conversation. Interruption ('barge-in') is a first-class primitive.\n\nThe important part isn't the API surface — it's the latency envelope. Anything under about 800ms feels like a real conversation. Above that, it feels like a menu.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Any prospect running a voice channel — sales dev, customer support, appointment setting — will now benchmark against realtime voice. Know enough about the primitives to have an informed opinion when it comes up.",
        },
        revops: {
          heading: "Why this matters",
          body: "Voice agents for outbound and qualification are now viable. Your CRM, dialer, and disposition logic need to handle AI callers as first-class actors, not screen-scraped afterthoughts.",
        },
        fde: {
          heading: "Why this matters",
          body: "A new integration pattern with real constraints: streaming audio, interruption handling, tool calls mid-utterance. Reference architectures are still being figured out — being fluent here is a differentiator.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You open a WebSocket to the Realtime endpoint. You configure a system prompt and a list of tools. You then stream audio frames up as they come from the user.\n\nThe server streams audio frames back. When the model wants to call a tool, it sends a structured message; your code executes the tool and streams the result back. All while the audio conversation continues.",
      },
      keyTakeaways: [
        "Sub-second latency is the unlock, not the API.",
        "Tool calling works mid-conversation.",
        "Barge-in and interruption are core, not bolt-ons.",
        "Failure modes are still real: hallucinations, echo, mis-hearing.",
        "Reliability comes from tight system prompts and explicit tool boundaries.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "A prospect asks whether you can 'do voice AI'. Distinguish between AI voice as a channel (Realtime API-style) and AI-assisted human agents (transcript + copilot). Different value props, different budgets.",
        },
        revops: {
          heading: "Apply it",
          body: "Audit your call-tracking and CRM setup. Can you tell an AI-driven call from a human one in reporting? Can you write dispositions from an AI call reliably back into the opportunity? If not, that's the work.",
        },
        fde: {
          heading: "Apply it",
          body: "Sketch a realtime voice agent for a customer's support line. Where do tools live (CRM lookup, order lookup, refund)? How do you escalate to a human without dropping context? What's the failure-mode UX when the model mishears?",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "Why is the Realtime API a step change vs. STT → LLM → TTS?",
          choices: [
            "It supports more languages",
            "It cuts end-to-end latency into the sub-second range",
            "It removes the need for a system prompt",
            "It's cheaper per token",
          ],
          correctIndex: 1,
          explanation:
            "The unlock is latency low enough to feel like a real conversation, including barge-in.",
        },
        {
          id: "q2",
          prompt: "Which is a first-class capability of the Realtime API?",
          choices: [
            "Fine-tuning during a call",
            "Tool calls streamed mid-conversation",
            "Guaranteed hallucination-free output",
            "Auto-generation of Salesforce reports",
          ],
          correctIndex: 1,
          explanation:
            "Tools can be invoked while audio streams; the model asks for a call, your code runs it, results flow back.",
        },
        {
          id: "q3",
          prompt: "For a support use case, the most important reliability lever is:",
          choices: [
            "A larger model",
            "A tight system prompt and explicit tool boundaries",
            "Longer context window",
            "Prompt caching",
          ],
          correctIndex: 1,
          explanation:
            "Realtime agents behave well when the surface area of what they can do is tightly scoped.",
        },
      ],
    },
  },
  {
    id: "anthropic-prompt-caching",
    signalId: "anthropic-prompt-caching",
    primaryConceptId: "prompt-caching",
    conceptsTaught: ["prompt-caching", "inference"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "Anthropic added Prompt Caching to the Claude API. A caller can mark a prefix of the prompt (a system prompt, a long document, a code base) as cacheable. On subsequent calls with the same prefix, the model reuses its work instead of re-processing the tokens.\n\nAnthropic reports up to 90% cost reduction and up to 85% latency reduction on prompts that reuse a long cached prefix.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "A caching primitive at the KV-cache layer of the model. Once a prefix is cached, subsequent calls that reuse it skip most of the compute.\n\nCaches expire quickly (minutes), so this is optimised for bursty, high-frequency requests — a chatbot on a long knowledge base, a code assistant on a repo, an agent that loops.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Token cost is a common objection on AI-heavy products. Prompt caching flips that math for any use case with a long, shared prompt. Good ammunition for pricing conversations.",
        },
        revops: {
          heading: "Why this matters",
          body: "If your team is building internal AI tools (research agents, brief generators, playbook readers) with long context, this is the single easiest cost lever. Move shared context to the front of the prompt so it caches.",
        },
        fde: {
          heading: "Why this matters",
          body: "This changes how you structure prompts. Put stable, shared context (system prompt, docs, few-shot examples) at the front so it caches; put the fast-changing user input at the end. Instrument cache-hit rate.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You add a cache_control marker at the point in your prompt where you want the cache to end. On first request the model does the full computation and stores the KV cache for that prefix. On subsequent requests, if the prefix is byte-identical, the model reuses the cached state and only processes the new suffix.\n\nPricing charges a small premium for the initial cache write, then a large discount on cache reads.",
      },
      keyTakeaways: [
        "Best for prompts with long, stable prefixes and short variable suffixes.",
        "Structure prompts front-loaded with cacheable context.",
        "Cache lifetime is short — think 'burst', not 'session'.",
        "Instrument cache-hit rate as a first-class metric.",
        "Doesn't help one-off unique prompts.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "In pricing pushback: 'our AI feature reads a long document each time — that must be expensive.' Response: with prompt caching, the document costs ~10% of raw token pricing after the first call. Cite the primary source.",
        },
        revops: {
          heading: "Apply it",
          body: "Pick one internal AI tool that reads a lot of context (a playbook, a wiki dump, a set of past deals). Move the context to the top of the prompt, add cache_control, measure the cost delta.",
        },
        fde: {
          heading: "Apply it",
          body: "In a customer's RAG or agent stack, audit prompt structure. Any prompt with a long stable prefix and short variable suffix should have cache_control at the split. Track cache-hit rate alongside p50 latency.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "Prompt caching gives the biggest win when:",
          choices: [
            "Each prompt is unique",
            "The prompt has a long stable prefix and a short variable suffix",
            "Prompts are very short",
            "You use many different models per call",
          ],
          correctIndex: 1,
          explanation:
            "The cached prefix is what saves work; the variable suffix is re-processed each call.",
        },
        {
          id: "q2",
          prompt: "Where should the fast-changing user input go in a cache-optimised prompt?",
          choices: [
            "At the very beginning",
            "In the middle, split across the cached region",
            "At the end, after the cache boundary",
            "In a separate API call",
          ],
          correctIndex: 2,
          explanation:
            "The stable, cacheable content must come first, uninterrupted, for the cache to hit.",
        },
        {
          id: "q3",
          prompt: "Which metric best tells you whether prompt caching is helping?",
          choices: [
            "Model temperature",
            "Cache-hit rate on read requests",
            "Number of tools registered",
            "System prompt length in tokens",
          ],
          correctIndex: 1,
          explanation:
            "Cache-hit rate is the direct read on how often you're actually paying the discounted price.",
        },
      ],
    },
  },
  {
    id: "openai-agents-sdk",
    signalId: "openai-agents-sdk",
    primaryConceptId: "agents",
    conceptsTaught: ["agents", "tool-calling", "eval"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "OpenAI shipped an Agents SDK and a new Responses API surface designed for multi-step agentic apps. The SDK provides built-in loops, structured hand-offs between agents, tracing, and evaluation hooks.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "An opinionated framework for building agents on OpenAI models. It bakes in the pattern most teams end up re-implementing: a loop that plans, calls tools, observes results, and either continues, hands off to another agent, or terminates.\n\nIt's not a new capability — it's a cleaner primitive for a pattern people have been rolling by hand.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Every AI-first buyer is picking an agent framework this year. Know what OpenAI's opinion is, so you can position your product against or alongside it without stumbling.",
        },
        revops: {
          heading: "Why this matters",
          body: "The floor for 'build an internal RevOps agent' just dropped. Understand the SDK enough to have a real opinion on whether you build in-house or buy a vendor's agent product.",
        },
        fde: {
          heading: "Why this matters",
          body: "A new mainline agent framework to evaluate for customer implementations. Learn the abstractions (agents, tools, handoffs, traces) and where they help vs. where a bespoke loop is still simpler.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You define agents. Each agent has a system prompt and a set of tools it can call. The runtime executes the agent loop: model call → tool call → observation → next model call.\n\nAgents can hand off to other agents (a triage agent forwards to a specialist), and every step is traced automatically so you can inspect failures and run evals.",
      },
      keyTakeaways: [
        "Codifies the standard agent loop as a first-class primitive.",
        "Hand-offs between agents let you compose specialists.",
        "Tracing and evals are built in — treat them as first-class outputs.",
        "It's opinionated; competing frameworks (LangGraph, custom loops) still exist.",
        "Vendor coupling is real — the SDK targets OpenAI models.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "In a competitive call: 'we're evaluating OpenAI's Agents SDK vs. your product.' Position clearly — your product isn't a framework; it's the domain-specific layer their agents will call into. Show what your MCP server or API exposes.",
        },
        revops: {
          heading: "Apply it",
          body: "Pick a real internal problem — deduping accounts, drafting research briefs, routing MQLs. Sketch a two-agent hand-off (triage → specialist) and decide whether it's worth building on the SDK or waiting for a vendor.",
        },
        fde: {
          heading: "Apply it",
          body: "For your next customer engagement, evaluate the Agents SDK against your current agent stack on three axes: traceability, hand-off ergonomics, and cost to migrate off if the customer's model preference changes.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "Which capability is native to the Agents SDK?",
          choices: [
            "Fine-tuning your own base model",
            "The agent loop and inter-agent hand-offs",
            "Building a data warehouse",
            "Speech synthesis",
          ],
          correctIndex: 1,
          explanation: "The SDK's core primitives are the loop and hand-offs, plus tracing.",
        },
        {
          id: "q2",
          prompt: "The main risk of adopting the SDK for a customer engagement is:",
          choices: [
            "It requires vector databases",
            "It's coupled to a single model vendor",
            "It doesn't support tool calling",
            "It only works with voice",
          ],
          correctIndex: 1,
          explanation:
            "It's built for OpenAI models — switching vendors later is real work.",
        },
        {
          id: "q3",
          prompt: "What should you instrument first when running an agent from the SDK in production?",
          choices: [
            "Prompt length",
            "Traces of the agent's tool calls and hand-offs",
            "Frontend page views",
            "Warehouse row counts",
          ],
          correctIndex: 1,
          explanation:
            "Traces are how you debug agent behaviour and drive evals.",
        },
      ],
    },
  },
  {
    id: "gpt-5-launch",
    signalId: "gpt-5-launch",
    primaryConceptId: "llm",
    conceptsTaught: ["llm", "inference"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "OpenAI announced GPT-5 as a single model surface that routes between faster responses and deeper reasoning behind the scenes. From the caller's perspective, one endpoint handles both fast chat and multi-step reasoning workloads.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "The 'single surface' idea is the interesting part. Prior generations exposed a menu of models (fast, reasoning, mini) and made you pick. GPT-5 collapses that behind routing logic, so the same API call can be cheap and quick for a simple ask, or use more compute for something harder.\n\nThe tradeoff: less caller control, more model-side dynamic behaviour.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Frontier launches reset customer expectations. Buyers will ask what changes for your product — 'do you support GPT-5?' and 'how does it change your feature roadmap?' are both fair game.",
        },
        revops: {
          heading: "Why this matters",
          body: "Model routing under a single API means your vendor conversations shift from 'which model do you support' to 'how does the vendor decide when to spend more compute on your workload'.",
        },
        fde: {
          heading: "Why this matters",
          body: "Re-benchmark: new pricing, new latency envelope, new reasoning quality. Any reference architecture that hard-codes model selection needs a look.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You call the model like any other chat completion. Internally, the model or a routing layer decides how much compute to spend on the request — quick heuristic responses for simple prompts, deeper reasoning for hard ones.\n\nAs the caller you can bias this with parameters, but the default is dynamic.",
      },
      keyTakeaways: [
        "One model surface, multiple reasoning modes.",
        "Less caller control over compute per request.",
        "Old model-selection code is now stale.",
        "Pricing and latency changed — benchmark before assuming.",
        "Frontier bar for what customers expect just moved.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "When a prospect asks 'do you support GPT-5?', answer three things: yes/no/soon; what changes for their workload; and why your feature works well independent of a specific frontier model.",
        },
        revops: {
          heading: "Apply it",
          body: "Audit any internal AI tool that hard-codes a specific model. If it can benefit from more compute on hard requests, GPT-5 (or an equivalent) may be a win — measure quality and cost delta on a real sample.",
        },
        fde: {
          heading: "Apply it",
          body: "For a customer implementation currently pinned to a specific model, run an A/B on a representative eval set. Compare quality, latency, and cost. Update your recommended default if the new model wins.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "What's the notable API shape change with GPT-5?",
          choices: [
            "It uses a new WebSocket protocol",
            "One surface routes between fast and deeper reasoning modes",
            "It removes tool calling",
            "It requires fine-tuning before use",
          ],
          correctIndex: 1,
          explanation:
            "The single-endpoint framing is the practical difference for most callers.",
        },
        {
          id: "q2",
          prompt: "Which of these should you re-check when a frontier model ships?",
          choices: [
            "Only the price",
            "Only latency",
            "Quality, latency, and cost on your real workload",
            "None of the above — trust the announcement",
          ],
          correctIndex: 2,
          explanation:
            "Vendor benchmarks generalise poorly; measure on your traffic.",
        },
      ],
    },
  },
  {
    id: "salesforce-agentforce",
    signalId: "salesforce-agentforce",
    primaryConceptId: "agents",
    conceptsTaught: ["agents", "crm"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "Salesforce launched Agentforce, a way to build and deploy autonomous agents on Salesforce data. It ships with a low-code builder, guardrails, and native access to CRM records, flows, and Data Cloud.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "Agentforce is Salesforce's answer to: 'now that agents work, how do we productise them on top of the CRM?' Instead of stitching an LLM into Salesforce yourself, you configure agents (topics, actions, guardrails) inside the platform.\n\nEach agent has topics (what it can talk about) and actions (what it can do). Actions call Salesforce flows, Apex, or external APIs.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Your Salesforce-centric buyers are getting a serious Agentforce pitch right now. Know its shape so you can position where you fit — most products don't compete with Agentforce head-on, they call into or from it.",
        },
        revops: {
          heading: "Why this matters",
          body: "This is a direct change in the tooling you own. Decide where Agentforce replaces custom flows (lead triage, case deflection), where it doesn't, and how it interacts with the data stack you already run.",
        },
        fde: {
          heading: "Why this matters",
          body: "Customers on Salesforce will expect your product to plug in alongside Agentforce. Understand the topics/actions model so you can design that integration and know where boundaries sit.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You define an agent, its topics (scopes it should handle), and its actions (things it can do). At runtime the model routes a user's message to a topic, chooses actions, and executes them via Salesforce flows or Apex.\n\nData Cloud provides the grounding layer — unified customer data the agent can read. Guardrails enforce what the agent can and cannot say or do.",
      },
      keyTakeaways: [
        "Topics = scopes; Actions = capabilities.",
        "Grounding on Data Cloud is a real advantage inside SFDC-heavy orgs.",
        "Low-code first, developer extensions second.",
        "Guardrails are configured, not implicit — audit them.",
        "External systems participate via Apex/flows/APIs.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "A Salesforce-centric prospect asks how you compare to Agentforce. Answer: we don't replace Agentforce; here's how our product is an action they can call, and here's the value we uniquely provide that Salesforce can't.",
        },
        revops: {
          heading: "Apply it",
          body: "Pick one workflow — say, tier-1 case triage. Sketch it as an Agentforce agent with two topics and three actions. Estimate the effort vs. building the same in flows plus a homegrown LLM step.",
        },
        fde: {
          heading: "Apply it",
          body: "In a customer engagement, design an Agentforce action that calls into your product. What auth model, what payload shape, what error handling? Prepare the Apex/flow wiring in advance so demos work.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "What's the difference between a Topic and an Action in Agentforce?",
          choices: [
            "Topics are UI templates; Actions are AI models",
            "Topics scope what the agent handles; Actions are things it can execute",
            "Topics are reports; Actions are dashboards",
            "There's no meaningful difference",
          ],
          correctIndex: 1,
          explanation:
            "Topics gate routing; Actions gate what the agent can actually do.",
        },
        {
          id: "q2",
          prompt: "The right way to compete with Agentforce as a non-CRM product is usually:",
          choices: [
            "Ignore it and hope prospects don't ask",
            "Build your own CRM",
            "Position as an action Agentforce calls, plus differentiated value",
            "Wait for it to fail",
          ],
          correctIndex: 2,
          explanation:
            "Agentforce is a platform; most products live above or below it, not in place of it.",
        },
      ],
    },
  },
  {
    id: "hubspot-breeze",
    signalId: "hubspot-breeze",
    primaryConceptId: "agents",
    conceptsTaught: ["agents", "crm"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "HubSpot bundled its AI features into Breeze — a set of copilots and role-specific agents baked into the HubSpot suite, with direct access to CRM data and workflows.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "Breeze is HubSpot's answer to bringing AI into every seat: copilots for authoring, prospecting agents for research and outbound, customer agents for support. All grounded in the HubSpot record.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Down-market and mid-market buyers are getting AI baked into HubSpot. Know how it compares to the AI in your product so you can qualify quickly rather than re-selling AI in every deal.",
        },
        revops: {
          heading: "Why this matters",
          body: "If your team runs on HubSpot, Breeze is a real build-vs-buy input on the prospecting, content, and support automations you may have planned. Pilot it before green-lighting bespoke builds.",
        },
        fde: {
          heading: "Why this matters",
          body: "Mostly awareness. Becomes relevant when the customer's HubSpot instance is part of the reference architecture you're proposing.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "Breeze agents run inside HubSpot with access to CRM data. Users interact with them like a colleague — asking Prospecting Agent to research an account, asking the copilot to draft an email. Actions execute against HubSpot records and integrations.",
      },
      keyTakeaways: [
        "Bundled, in-suite AI for HubSpot users.",
        "Role-based agents (prospecting, content, customer).",
        "Grounded in the HubSpot record.",
        "Competes with standalone AI point tools for HubSpot orgs.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "For a HubSpot-native prospect: ask what they've already tried in Breeze. Position your product as the thing that goes deeper on a specific job Breeze does shallowly.",
        },
        revops: {
          heading: "Apply it",
          body: "Turn on Breeze prospecting for two reps for a month. Measure lift vs. a control group. Decide whether to standardise, add a specialist tool, or roll your own.",
        },
        fde: {
          heading: "Apply it",
          body: "In a customer engagement using HubSpot, identify which Breeze feature overlaps with what you're proposing. Show the added value clearly so procurement doesn't collapse you into 'covered by Breeze'.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "Breeze is best described as:",
          choices: [
            "A standalone LLM provider",
            "In-suite AI copilots and role-specific agents inside HubSpot",
            "A data warehouse",
            "A voice-only product",
          ],
          correctIndex: 1,
          explanation: "It's HubSpot's bundled AI, grounded on HubSpot data.",
        },
        {
          id: "q2",
          prompt: "For a specialist AI vendor selling into HubSpot orgs, Breeze is:",
          choices: [
            "A pure blocker",
            "A baseline to differentiate against on depth or verticalisation",
            "Irrelevant",
            "A distribution channel",
          ],
          correctIndex: 1,
          explanation:
            "Breeze covers common AI use cases shallowly; vendors win on depth or verticals.",
        },
      ],
    },
  },
  {
    id: "clay-agents",
    signalId: "clay-agents",
    primaryConceptId: "agents",
    conceptsTaught: ["agents", "gtm-tooling"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "Clay expanded its enrichment platform with AI agents that research accounts and people using the open web and structured providers, driven by natural-language prompts.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "Clay is a spreadsheet-shaped enrichment platform. The addition of AI agents turns rows into research tasks: 'find the head of RevOps at this company; return name, LinkedIn, and their recent posts about AI.' Under the hood, Clay orchestrates web scraping, providers, and LLM calls.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Your reps and their competitors are using Clay to research prospects. Understanding it sharpens outbound cadences and account plans — and it's a strong indicator of where prospecting is heading.",
        },
        revops: {
          heading: "Why this matters",
          body: "Clay is quietly displacing chunks of the traditional enrichment stack. Own the decision on where Clay fits vs. legacy providers and how it interacts with Reverse ETL and the warehouse.",
        },
        fde: {
          heading: "Why this matters",
          body: "Context for RevOps-adjacent conversations. Less immediately relevant to the architectures you deploy for customers, but useful shorthand for what agent-enabled GTM tools look like.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You build a Clay table. Each column is a step — a provider call, a scrape, an LLM prompt, an enrichment agent. Rows flow through those steps; results end up in your CRM via native pushes or Reverse ETL.",
      },
      keyTakeaways: [
        "Spreadsheet as an orchestration surface for enrichment.",
        "Agents make research tasks that used to be manual scale-able.",
        "Works alongside Reverse ETL and CRM.",
        "Vendor cost stacks up as you enable more providers — watch usage.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "Ask your rep team what they can now research about prospects in 30 seconds that used to take 30 minutes. Fold that into discovery — your outbound quality expectations should have risen.",
        },
        revops: {
          heading: "Apply it",
          body: "Build one Clay table replacing a legacy enrichment workflow. Compare cost, freshness, and CRM outcomes for one month. Decide what to consolidate.",
        },
        fde: {
          heading: "Apply it",
          body: "When a RevOps stakeholder mentions Clay in a customer conversation, have a working mental model of what it does. Know how it might feed data your product needs.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "Clay's core surface is closest to:",
          choices: [
            "A spreadsheet used as an orchestration layer",
            "A voice assistant",
            "A data warehouse",
            "A CRM",
          ],
          correctIndex: 0,
          explanation:
            "Rows and columns, each column a step (provider, scrape, LLM, agent).",
        },
        {
          id: "q2",
          prompt: "The main risk of scaling Clay usage is:",
          choices: [
            "Overwriting your warehouse",
            "Provider and LLM cost stacking as workflows grow",
            "Loss of on-prem control",
            "It only supports two data sources",
          ],
          correctIndex: 1,
          explanation:
            "Each step often costs a call to an outside provider or a model — costs compound.",
        },
      ],
    },
  },
  {
    id: "cursor-composer",
    signalId: "cursor-composer",
    primaryConceptId: "agents",
    conceptsTaught: ["agents", "tool-calling"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "Cursor released Composer, a multi-file editing surface driven by an agent that can plan, edit across files, and run terminals from inside the IDE.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "Composer is an in-editor agent. You describe a change; it proposes a plan and edits multiple files, running commands as needed. You review a diff before it lands.\n\nIt's a concrete example of an agent whose 'computer' is a codebase.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Awareness. Useful shorthand when talking to developer-facing buyers about how AI is changing their day-to-day.",
        },
        revops: {
          heading: "Why this matters",
          body: "Low direct relevance. A good example of what agent-driven UX looks like when it's actually shipped and used.",
        },
        fde: {
          heading: "Why this matters",
          body: "This changes how you ship code — and how your customer's engineers do too. Worth a real trial to know when to recommend it, and to keep up with the UX bar customers now expect from developer tools.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "Composer indexes the repo, chooses relevant files given a prompt, proposes an edit plan, and applies edits with your approval. It can execute shell commands to verify (test runs, builds).",
      },
      keyTakeaways: [
        "An agent scoped to a codebase.",
        "Plan → edit → verify loop.",
        "Diff-first UX — the human is in the loop.",
        "A live example of agent UX done well.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "When a developer-focused prospect brings up Cursor, understand the shape of what they're doing all day. That shapes how you should demo and where their pain sits.",
        },
        revops: {
          heading: "Apply it",
          body: "Try Composer once on a small internal tool. Not because you'll adopt it — but so your intuition on 'what agent UX feels like' is calibrated for RevOps roadmap conversations.",
        },
        fde: {
          heading: "Apply it",
          body: "Use Composer on your own reference implementations. Note where it's a step change and where a human still has to think. Bring those observations into customer conversations about their own agent bets.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "Composer is best described as:",
          choices: [
            "A standalone LLM API",
            "An in-IDE agent for multi-file edits with a diff-first UX",
            "A CRM plugin",
            "A voice interface for coding",
          ],
          correctIndex: 1,
          explanation:
            "The plan → edit → verify loop, scoped to a codebase, with human review.",
        },
        {
          id: "q2",
          prompt: "Why does 'diff-first' matter as a UX choice?",
          choices: [
            "It looks nicer",
            "It keeps a human reviewer in the loop when the agent might be wrong",
            "It saves tokens",
            "It's required by GitHub",
          ],
          correctIndex: 1,
          explanation:
            "Agents make mistakes; a diff review keeps the human as the last check.",
        },
      ],
    },
  },
  {
    id: "snowflake-cortex",
    signalId: "snowflake-cortex",
    primaryConceptId: "rag",
    conceptsTaught: ["rag", "embeddings", "data-warehouse"],
    sections: {
      whatHappened: {
        heading: "What happened",
        body: "Snowflake shipped Cortex — LLM, embedding, and retrieval functions callable directly in SQL, running inside the Snowflake warehouse. Analysts and pipelines can query and generate against models without moving data.",
      },
      whatIsIt: {
        heading: "What is it",
        body: "Cortex is 'AI as SQL functions' — for example, calling COMPLETE(model, prompt) or EMBED(text) in a query. Retrieval helpers make RAG on warehouse data straightforward.\n\nBecause it runs inside Snowflake, data doesn't leave the security perimeter and there's no separate inference service to operate.",
      },
      whyItMatters: {
        gtm: {
          heading: "Why this matters",
          body: "Useful for enterprise conversations. Data-team buyers may bring up Cortex when evaluating anything AI-adjacent — know how your product complements it rather than fights it.",
        },
        revops: {
          heading: "Why this matters",
          body: "If your analytics stack runs on Snowflake, Cortex is a real path to AI-enriched pipelines without new infrastructure. Consider it for enrichment, summarisation, and classification jobs.",
        },
        fde: {
          heading: "Why this matters",
          body: "A meaningful reference-architecture pattern: keep data in the warehouse and call models via SQL. Know when this beats a standalone RAG service.",
        },
      },
      howItWorks: {
        heading: "How it works",
        body: "You call functions like COMPLETE, EMBED, and search functions directly in SQL. Snowflake runs the model on your data, in your account, without leaving the warehouse boundary. Costs are billed via credits.",
      },
      keyTakeaways: [
        "AI as SQL — no data movement.",
        "Retrieval helpers make warehouse-native RAG easy.",
        "Stays inside the Snowflake security boundary.",
        "Costs are metered in credits; measure per pipeline.",
        "Best when data already lives in Snowflake; less compelling otherwise.",
      ],
      apply: {
        gtm: {
          heading: "Apply it",
          body: "For a Snowflake-heavy prospect, know how to position: your product is upstream of, or downstream of, or complementary to Cortex. Never accidentally sound like you're competing with it.",
        },
        revops: {
          heading: "Apply it",
          body: "Pick one enrichment or classification job in the warehouse. Rewrite it as a Cortex SQL pipeline. Compare cost, latency, and complexity to your current setup.",
        },
        fde: {
          heading: "Apply it",
          body: "When a customer's data already lives in Snowflake and they're evaluating a separate RAG stack, run the numbers on Cortex first. Only propose external infrastructure when the workload actually needs it.",
        },
      },
      quiz: [
        {
          id: "q1",
          prompt: "The biggest structural benefit of Cortex is:",
          choices: [
            "Cheaper embeddings than any other provider",
            "Running model calls where the data already lives, without data movement",
            "Faster inference than dedicated GPU clusters",
            "Native support for voice",
          ],
          correctIndex: 1,
          explanation:
            "The data-locality property is the point — no separate service to run, no data leaving Snowflake.",
        },
        {
          id: "q2",
          prompt: "Cortex is least compelling when:",
          choices: [
            "Your data is already in Snowflake",
            "You need SQL-native RAG",
            "Your data lives outside Snowflake in a very different stack",
            "You need warehouse-scoped model calls",
          ],
          correctIndex: 2,
          explanation:
            "If the data isn't in Snowflake, you lose the locality benefit and the price/complexity story flips.",
        },
      ],
    },
  },
];

export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);
