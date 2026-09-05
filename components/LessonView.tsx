"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CONCEPTS_BY_ID } from "@/data/concepts";
import { applyQuizResults, bumpConcept, statusForScore } from "@/lib/knowledge";
import { todayISO } from "@/lib/format";
import { saveProgress } from "@/lib/storage";
import type { Lesson, Profile, Progress, Role } from "@/lib/types";

type Step =
  | { kind: "section"; key: string; heading: string; body: string }
  | { kind: "takeaways"; heading: string; items: string[] }
  | { kind: "apply"; heading: string; body: string }
  | { kind: "quiz" }
  | { kind: "results" };

function paragraphsOf(body: string) {
  return body.split("\n\n").map((p, i) => (
    <p key={i} className="prose-signal">
      {p}
    </p>
  ));
}

function buildSteps(lesson: Lesson, role: Role): Step[] {
  const s = lesson.sections;
  return [
    { kind: "section", key: "what", heading: s.whatHappened.heading, body: s.whatHappened.body },
    { kind: "section", key: "def", heading: s.whatIsIt.heading, body: s.whatIsIt.body },
    {
      kind: "section",
      key: "why",
      heading: s.whyItMatters[role].heading,
      body: s.whyItMatters[role].body,
    },
    { kind: "section", key: "how", heading: s.howItWorks.heading, body: s.howItWorks.body },
    { kind: "takeaways", heading: "What to remember", items: s.keyTakeaways },
    {
      kind: "apply",
      heading: s.apply[role].heading,
      body: s.apply[role].body,
    },
    { kind: "quiz" },
    { kind: "results" },
  ];
}

export function LessonView({
  lesson,
  profile,
  progress,
}: {
  lesson: Lesson;
  profile: Profile;
  progress: Progress;
}) {
  const router = useRouter();
  const steps = useMemo(() => buildSteps(lesson, profile.role), [lesson, profile.role]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [finalProgress, setFinalProgress] = useState<Progress | null>(null);

  const step = steps[i];
  const isLast = i === steps.length - 1;

  const results = useMemo(() => {
    const perConcept: Record<string, { correct: number; total: number }> = {};
    let correct = 0;
    for (const q of lesson.sections.quiz) {
      const cid = q.conceptId ?? lesson.primaryConceptId;
      perConcept[cid] = perConcept[cid] ?? { correct: 0, total: 0 };
      perConcept[cid].total += 1;
      if (answers[q.id] === q.correctIndex) {
        perConcept[cid].correct += 1;
        correct += 1;
      }
    }
    return { perConcept, correct, total: lesson.sections.quiz.length };
  }, [answers, lesson]);

  function submitQuiz() {
    setSubmitted(true);
    let next = applyQuizResults(progress, results.perConcept, lesson.primaryConceptId);
    for (const cid of lesson.conceptsTaught) {
      if (!(cid in results.perConcept)) next = bumpConcept(next, cid, 15);
    }
    const today = todayISO();
    const streak =
      next.lastActiveDate === today
        ? next.streak
        : next.lastActiveDate === yesterdayISO()
          ? next.streak + 1
          : 1;
    next = {
      ...next,
      completedLessons: Array.from(new Set([...next.completedLessons, lesson.id])),
      lastActiveDate: today,
      streak,
    };
    saveProgress(next);
    setFinalProgress(next);
    setI((x) => x + 1);
  }

  function pct(x: number, total: number) {
    return total === 0 ? 0 : Math.round((x / total) * 100);
  }

  return (
    <div>
      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-ink transition-all"
          style={{ width: `${((i + 1) / steps.length) * 100}%` }}
        />
      </div>

      {step.kind === "section" && (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{step.heading}</h2>
          <div className="mt-4 space-y-4 text-ink">{paragraphsOf(step.body)}</div>
        </section>
      )}

      {step.kind === "takeaways" && (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{step.heading}</h2>
          <ul className="mt-6 space-y-3">
            {step.items.map((item, k) => (
              <li
                key={k}
                className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-card"
              >
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-signal-accent" />
                <span className="text-ink">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step.kind === "apply" && (
        <section>
          <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
            Apply it
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {step.heading}
          </h2>
          <div className="mt-4 space-y-4 text-ink">{paragraphsOf(step.body)}</div>
        </section>
      )}

      {step.kind === "quiz" && (
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">
            Quick check
          </h2>
          <p className="mt-2 text-ink-muted">
            {lesson.sections.quiz.length} question
            {lesson.sections.quiz.length === 1 ? "" : "s"}. Your answers update
            your knowledge map.
          </p>

          <div className="mt-6 space-y-6">
            {lesson.sections.quiz.map((q, qi) => (
              <div
                key={q.id}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-card"
              >
                <div className="text-xs font-medium uppercase tracking-widest text-ink-muted">
                  Question {qi + 1}
                </div>
                <div className="mt-2 text-base font-medium text-ink">
                  {q.prompt}
                </div>
                <div className="mt-4 grid gap-2">
                  {q.choices.map((c, ci) => {
                    const selected = answers[q.id] === ci;
                    return (
                      <button
                        key={ci}
                        onClick={() =>
                          !submitted &&
                          setAnswers((prev) => ({ ...prev, [q.id]: ci }))
                        }
                        disabled={submitted}
                        className={
                          "rounded-xl border px-4 py-3 text-left text-sm transition " +
                          (selected
                            ? "border-ink bg-paper-soft"
                            : "border-black/10 bg-white hover:border-ink/40")
                        }
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-end">
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length !== lesson.sections.quiz.length}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-40"
            >
              Submit answers
            </button>
          </div>
        </section>
      )}

      {step.kind === "results" && finalProgress && (
        <section>
          <div className="text-[11px] font-medium uppercase tracking-widest text-ink-muted">
            Lesson complete
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            You scored {results.correct} / {results.total}
          </h2>
          <p className="mt-2 text-ink-muted">
            Your knowledge map has been updated.
          </p>

          <div className="mt-6 grid gap-3">
            {lesson.conceptsTaught.map((cid) => {
              const c = CONCEPTS_BY_ID[cid];
              const k = finalProgress.knowledge[cid];
              const score = k?.score ?? 0;
              return (
                <div
                  key={cid}
                  className="rounded-2xl border border-black/5 bg-white p-4 shadow-card"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-medium text-ink">{c?.name ?? cid}</div>
                    <div className="text-xs uppercase tracking-widest text-ink-muted">
                      {statusForScore(score)}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-signal-accent"
                      style={{ width: `${pct(score, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-ink-muted">
                    {score}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper"
            >
              Back to today
            </Link>
            <Link
              href="/knowledge"
              className="rounded-full border border-black/10 px-5 py-3 text-sm text-ink hover:bg-white"
            >
              See knowledge map
            </Link>
          </div>
        </section>
      )}

      {step.kind !== "quiz" && step.kind !== "results" && (
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setI((x) => Math.max(0, x - 1))}
            disabled={i === 0}
            className="rounded-full px-4 py-2 text-sm text-ink-muted disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))}
            disabled={isLast}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
