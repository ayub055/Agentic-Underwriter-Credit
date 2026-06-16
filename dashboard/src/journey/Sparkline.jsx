// Tiny theme-aware SVG sparkline. Reused for amortization (offer simulator) and
// the CAM exposure/cashflow trends. Pass a `stroke-*` / `fill-*` utility class.
export default function Sparkline({
  values = [],
  className = "stroke-agent-500",
  fillClassName,
  width = 120,
  height = 32,
}) {
  const clean = values.filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (clean.length < 2) return null;

  const max = Math.max(...clean);
  const min = Math.min(...clean);
  const span = max - min || 1;
  const pad = 2;
  const pts = clean.map((v, i) => {
    const x = (i / (clean.length - 1)) * width;
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" aria-hidden="true">
      {fillClassName && <path d={`${d} L ${width} ${height} L 0 ${height} Z`} className={fillClassName} />}
      <path d={d} fill="none" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
