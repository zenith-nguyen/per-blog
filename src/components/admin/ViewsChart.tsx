// Pure-SVG 30-day views chart — no chart library, renders on the server.
export default function ViewsChart({ data }: { data: { date: string; count: number }[] }) {
  const W = 720;
  const H = 180;
  const PAD = 8;
  const max = Math.max(1, ...data.map((d) => d.count));
  const step = (W - PAD * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => ({
    x: PAD + i * step,
    y: H - PAD - ((H - PAD * 2) * d.count) / max,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Biểu đồ lượt xem 30 ngày, cao nhất ${max} lượt/ngày`}
    >
      <defs>
        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={PAD}
          x2={W - PAD}
          y1={H - PAD - (H - PAD * 2) * f}
          y2={H - PAD - (H - PAD * 2) * f}
          stroke="currentColor"
          strokeOpacity="0.08"
        />
      ))}
      <path d={area} fill="url(#viewsFill)" />
      <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p, i) =>
        i === points.length - 1 ? (
          <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="var(--color-accent)" />
        ) : null
      )}
    </svg>
  );
}
