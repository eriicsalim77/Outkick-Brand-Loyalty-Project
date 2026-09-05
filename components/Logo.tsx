export function Logo({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <span
        aria-hidden
        className="inline-block rounded-full bg-signal-p1"
        style={{ width: size / 2, height: size / 2 }}
      />
      <span style={{ fontSize: size }}>Signal</span>
    </span>
  );
}
