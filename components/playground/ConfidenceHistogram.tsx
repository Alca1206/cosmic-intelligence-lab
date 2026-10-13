const W = 360;
const H = 220;
const PAD = { left: 44, right: 12, top: 12, bottom: 40 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

type Props = {
  counts: number[];
  meanConfidence: number;
  accuracy: number;
  label: string;
};

// How many predictions fall at each confidence level, with the average
// confidence and the true accuracy marked. If the confidence line sits to the
// right of the accuracy line, the model claims more certainty than it earns.
export default function ConfidenceHistogram({ counts, meanConfidence, accuracy, label }: Props) {
  const total = counts.reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...counts, 1);
  const bins = counts.length;
  const xs = (v: number) => PAD.left + v * PLOT_W;
  const ys = (c: number) => PAD.top + PLOT_H - (c / maxCount) * PLOT_H;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Confidence distribution, ${label}. ${total} predictions in ${bins} bins. Average confidence ${(meanConfidence * 100).toFixed(1)} percent, accuracy ${(accuracy * 100).toFixed(1)} percent.`}
        className="h-auto w-full max-w-md"
      >
        <line x1={PAD.left} x2={W - PAD.right} y1={ys(0)} y2={ys(0)} className="stroke-line" />
        {counts.map((c, i) => (
          <rect
            key={i}
            x={xs(i / bins) + 1}
            width={Math.max(PLOT_W / bins - 2, 1)}
            y={ys(c)}
            height={ys(0) - ys(c)}
            className="fill-cyan/50 stroke-cyan"
            strokeWidth="1"
          />
        ))}
        <line x1={xs(accuracy)} x2={xs(accuracy)} y1={PAD.top} y2={ys(0)} className="stroke-violet" strokeWidth="2" />
        <line
          x1={xs(meanConfidence)}
          x2={xs(meanConfidence)}
          y1={PAD.top}
          y2={ys(0)}
          className="stroke-ink"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        {[0, 0.5, 1].map((t) => (
          <text key={t} x={xs(t)} y={H - PAD.bottom + 14} textAnchor="middle" className="fill-ink-muted text-[10px]">
            {t * 100}%
          </text>
        ))}
        <text x={PAD.left - 6} y={ys(maxCount) + 8} textAnchor="end" className="fill-ink-muted text-[10px]">
          {maxCount}
        </text>
        <text x={PAD.left - 6} y={ys(0) + 3} textAnchor="end" className="fill-ink-muted text-[10px]">
          0
        </text>
        <text x={PAD.left + PLOT_W / 2} y={H - 6} textAnchor="middle" className="fill-ink-muted text-[11px]">
          Confidence (highest probability)
        </text>
        <text
          transform={`translate(12 ${PAD.top + PLOT_H / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-ink-muted text-[11px]"
        >
          Images
        </text>
      </svg>
      <figcaption className="mt-2 max-w-md text-sm text-ink-muted">
        Solid violet line: accuracy ({(accuracy * 100).toFixed(1)}%). Dashed line: average confidence (
        {(meanConfidence * 100).toFixed(1)}%). Counts per bin:{" "}
        <span className="break-words">{counts.join(", ")}.</span>
      </figcaption>
    </figure>
  );
}
