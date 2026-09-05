"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { CONCEPTS } from "@/data/concepts";
import { seedKnown } from "@/lib/knowledge";
import { loadProgress, saveProfile, saveProgress } from "@/lib/storage";
import type { Industry, Level, Profile, Role } from "@/lib/types";

const ROLES: { id: Role; label: string; blurb: string }[] = [
  {
    id: "gtm",
    label: "GTM",
    blurb: "AE, SDR, GTM associate, sales engineer-adjacent.",
  },
  {
    id: "revops",
    label: "RevOps",
    blurb: "Revenue, GTM, sales, or marketing operations.",
  },
  {
    id: "fde",
    label: "FDE",
    blurb: "Forward-deployed, solutions, or customer engineer.",
  },
];

const INDUSTRIES: { id: Industry; label: string }[] = [
  { id: "ai", label: "AI" },
  { id: "saas", label: "SaaS" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "fintech", label: "Fintech" },
  { id: "devtools", label: "Developer Tools" },
  { id: "other", label: "Other" },
];

const LEVELS: { id: Level; label: string; blurb: string }[] = [
  {
    id: "beginner",
    label: "Beginner",
    blurb: "I know the words but not how they fit together.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    blurb: "I can explain the concepts and connect them to products.",
  },
  {
    id: "advanced",
    label: "Advanced",
    blurb: "I've built or shipped with these technologies.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState("");
  const [known, setKnown] = useState<string[]>([]);
  const [wants, setWants] = useState<string[]>([]);

  const canNext = useMemo(() => {
    if (step === 0) return role !== null;
    if (step === 1) return industry !== null && level !== null;
    if (step === 2) return goal.trim().length > 3;
    return true;
  }, [step, role, industry, level, goal]);

  function toggle(list: string[], id: string, setter: (v: string[]) => void) {
    if (list.includes(id)) setter(list.filter((x) => x !== id));
    else setter([...list, id]);
  }

  function submit() {
    if (!role || !industry || !level) return;
    const profile: Profile = {
      name: name.trim() || undefined,
      role,
      industry,
      level,
      goal: goal.trim(),
      known,
      wantsToLearn: wants,
      companies: [],
      createdAt: Date.now(),
    };
    saveProfile(profile);
    const seeded = seedKnown(loadProgress(), known);
    saveProgress(seeded);
    router.push("/dashboard");
  }

  const concepts = CONCEPTS.filter(
    (c) => c.category === "AI" || c.category === "GTM" || c.category === "Engineering",
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Logo />
        <div className="text-xs text-ink-muted">
          Step {step + 1} of 4
        </div>
      </header>

      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-ink transition-all"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>

      {step === 0 && (
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">What's your role?</h1>
          <p className="mt-2 text-ink-muted">
            We tune everything — priorities, explanations, quizzes — to your role.
          </p>
          <div className="mt-6 grid gap-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={
                  "rounded-2xl border p-5 text-left transition " +
                  (role === r.id
                    ? "border-ink bg-white shadow-card"
                    : "border-black/10 bg-white hover:border-ink/40")
                }
              >
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-semibold">{r.label}</div>
                  <div className="text-xs text-ink-muted">{r.id.toUpperCase()}</div>
                </div>
                <div className="mt-1 text-sm text-ink-muted">{r.blurb}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            Industry and technical level
          </h1>
          <p className="mt-2 text-ink-muted">
            This shapes what counts as P1 for you vs. background noise.
          </p>

          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-ink">Industry</div>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setIndustry(i.id)}
                  className={
                    "rounded-full border px-4 py-1.5 text-sm transition " +
                    (industry === i.id
                      ? "border-ink bg-ink text-paper"
                      : "border-black/10 bg-white text-ink hover:border-ink/40")
                  }
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 text-sm font-medium text-ink">
              Technical level
            </div>
            <div className="grid gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={
                    "rounded-2xl border p-4 text-left transition " +
                    (level === l.id
                      ? "border-ink bg-white shadow-card"
                      : "border-black/10 bg-white hover:border-ink/40")
                  }
                >
                  <div className="text-base font-semibold">{l.label}</div>
                  <div className="mt-1 text-sm text-ink-muted">{l.blurb}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            What's the goal?
          </h1>
          <p className="mt-2 text-ink-muted">
            Whatever you're trying to reach in the next 6–12 months. This anchors
            what we bias toward when things are close calls.
          </p>
          <div className="mt-6">
            <label className="text-sm font-medium text-ink">Name (optional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eric"
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-ink"
            />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-ink">Goal</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Become technically fluent enough to sell AI infrastructure to technical buyers."
              rows={4}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-ink"
            />
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h1 className="text-3xl font-semibold tracking-tight">
            What do you know, and what do you want to learn?
          </h1>
          <p className="mt-2 text-ink-muted">
            Optional. Tap concepts you already have solid intuition on, and ones
            you want to prioritise.
          </p>

          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-ink">I already know</div>
            <div className="flex flex-wrap gap-2">
              {concepts.map((c) => {
                const on = known.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(known, c.id, setKnown)}
                    className={
                      "rounded-full border px-3 py-1 text-sm transition " +
                      (on
                        ? "border-ink bg-ink text-paper"
                        : "border-black/10 bg-white text-ink hover:border-ink/40")
                    }
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-2 text-sm font-medium text-ink">
              I want to learn
            </div>
            <div className="flex flex-wrap gap-2">
              {concepts.map((c) => {
                const on = wants.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(wants, c.id, setWants)}
                    className={
                      "rounded-full border px-3 py-1 text-sm transition " +
                      (on
                        ? "border-signal-accent bg-signal-accent/10 text-signal-accent"
                        : "border-black/10 bg-white text-ink hover:border-ink/40")
                    }
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full px-4 py-2 text-sm text-ink-muted disabled:opacity-40"
        >
          Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => canNext && setStep((s) => s + 1)}
            disabled={!canNext}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={submit}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper"
          >
            Show me today's signals
          </button>
        )}
      </div>
    </div>
  );
}
