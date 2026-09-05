import type { Priority } from "@/lib/types";

const styles: Record<Priority, { dot: string; label: string; bg: string; text: string }> = {
  P1: {
    dot: "bg-signal-p1",
    label: "P1 · Know this",
    bg: "bg-signal-p1/10",
    text: "text-signal-p1",
  },
  P2: {
    dot: "bg-signal-p2",
    label: "P2 · Useful context",
    bg: "bg-signal-p2/10",
    text: "text-signal-p2",
  },
  P3: {
    dot: "bg-signal-p3",
    label: "P3 · Awareness",
    bg: "bg-signal-p3/10",
    text: "text-signal-p3",
  },
};

export function PriorityBadge({
  priority,
  size = "md",
}: {
  priority: Priority;
  size?: "sm" | "md";
}) {
  const s = styles[priority];
  return (
    <span
      className={
        `inline-flex items-center gap-2 rounded-full ${s.bg} ${s.text} ` +
        (size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs")
      }
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
      <span className="font-medium">{s.label}</span>
    </span>
  );
}
