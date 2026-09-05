import type { Profile } from "@/lib/types";

const ROLE_LABEL: Record<string, string> = {
  gtm: "GTM",
  revops: "RevOps",
  fde: "FDE",
};

const INDUSTRY_LABEL: Record<string, string> = {
  ai: "AI",
  saas: "SaaS",
  cybersecurity: "Cybersecurity",
  fintech: "Fintech",
  devtools: "Developer Tools",
  other: "Other",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function ProfileSummary({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
        Your profile
      </div>
      <div className="mt-1 text-lg font-semibold">
        {profile.name ? `${profile.name} — ` : ""}
        {ROLE_LABEL[profile.role]} · {INDUSTRY_LABEL[profile.industry]}
      </div>
      <div className="text-sm text-ink-muted">
        {LEVEL_LABEL[profile.level]} · Goal: {profile.goal}
      </div>
    </div>
  );
}
