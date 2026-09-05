export type Role = "gtm" | "revops" | "fde";

export type Level = "beginner" | "intermediate" | "advanced";

export type Priority = "P1" | "P2" | "P3";

export type Industry =
  | "ai"
  | "saas"
  | "cybersecurity"
  | "fintech"
  | "devtools"
  | "other";

export interface Profile {
  name?: string;
  role: Role;
  industry: Industry;
  level: Level;
  goal: string;
  known: string[];
  wantsToLearn: string[];
  companies: string[];
  createdAt: number;
}

export type ConfidenceStatus = "unknown" | "attention" | "developing" | "strong";

export interface KnowledgeEntry {
  conceptId: string;
  score: number; // 0..100
  status: ConfidenceStatus;
  updatedAt: number;
}

export interface Progress {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedLessons: string[]; // lesson ids
  skippedSignals: string[]; // signal ids
  knowledge: Record<string, KnowledgeEntry>;
}

export interface Concept {
  id: string;
  name: string;
  category: string; // e.g. "AI", "Infra", "GTM"
  parents?: string[]; // higher-level buckets
  prerequisites?: string[]; // concept ids that should be learned first
  blurb: string;
}

export type SourceTier = 1 | 2 | 3;

export interface Source {
  publisher: string;
  url: string;
  tier: SourceTier;
  publishedAt: string; // YYYY-MM-DD
  label?: string; // e.g. "Official announcement", "Documentation"
}

export interface RoleRelevance {
  score: number; // 0..100
  reason: string; // "Why this matters to you" copy, written for this role
}

export interface Signal {
  id: string;
  title: string;
  summary: string; // one-paragraph what-happened
  category: string; // human-readable ("AI Infrastructure", "Developer Tools")
  technologies: string[]; // concept ids touched
  source: Source;
  minutesToRead: number;
  industries: Industry[]; // industries this is relevant to
  base: {
    novelty: number; // 0..100 how new/important
    velocity: number; // 0..100 how fast adoption is happening
  };
  relevance: Record<Role, RoleRelevance>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  conceptId?: string; // concept this question probes
}

export interface LessonSection {
  heading: string;
  body: string; // markdown-ish plain paragraphs, split by \n\n
}

export interface Lesson {
  id: string; // matches signal id
  signalId: string;
  primaryConceptId: string;
  sections: {
    whatHappened: LessonSection;
    whatIsIt: LessonSection;
    whyItMatters: Record<Role, LessonSection>;
    howItWorks: LessonSection;
    keyTakeaways: string[];
    apply: Record<Role, LessonSection>;
    quiz: QuizQuestion[];
  };
  conceptsTaught: string[]; // concept ids
}

export type ComputedPriority = {
  priority: Priority;
  score: number;
  reason: string;
};

// Lighter-weight than a Signal — a trending item pulled from Exa (or a
// hand-authored fallback). No lesson attached; primary CTA is "read source".
export interface TrendingItem {
  id: string;
  title: string;
  snippet: string;
  url: string;
  publisher: string;
  publishedAt: string; // YYYY-MM-DD
  technologies: string[]; // concept ids inferred by keyword match
  momentum: number; // 0..100 — combined recency + domain weight + Exa score
  tier: SourceTier;
}

export interface RoadmapItem {
  conceptId: string;
  lessonId: string | null; // null when the concept has no lesson yet
  reason: string; // why this is next for this user
  dependsOn: string[]; // concept ids
}

// Personalised view of a live signal for one specific role.
export interface PersonalRelevance {
  priority: Priority;
  score: number;
  reason: string; // "why this matters to you"
  apply: string; // one concrete prompt for this role
}

// A TrendingItem that's been through personalisation + short-lesson generation.
// Enhancement is either LLM-authored (when ANTHROPIC_API_KEY is set) or
// falls back to templated text keyed off inferred concepts.
export interface EnhancedTrendingItem extends TrendingItem {
  whatIsIt: string; // one-paragraph plain-language explainer of the underlying concept
  keyTakeaways: string[]; // 3 bullets
  personal: Record<Role, PersonalRelevance>;
  enhancedBy: "llm" | "template";
}
