import type { ReliabilityBin } from "@/lib/ml/types";

const SIZE = 360;
const PAD = { left: 44, right: 12, top: 12, bottom: 40 };
const PLOT = SIZE - PAD.left - PAD.right;

const x = (v: number) => PAD.left + v * PLOT;
const y = (v: number) => SIZE - PAD.bottom - v * (SIZE - PAD.top - PAD.bottom);
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

// Bars show how often the model was right in each confidence bin. A perfectly
// calibrated model has every bar touching the dashed diagonal.
export default function ReliabilityDiagram({ bins, label }: { bins: ReliabilityBin[]; label: string }) {
  const filled = bins.filter((b) => b.count > 0);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <figure>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Reliability diagram, ${label}. ${filled.length} of ${bins.length} bins contain predictions. A data table follows.`}
        className="h-auto w-full max-w-md"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={SIZE - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" className="fill-ink-muted text-[10px]">
              {t * 100}%
            </text>
            <text x={x(t)} y={SIZE - PAD.bottom + 14} textAnchor="middle" className="fill-ink-muted text-[10px]">
              {t * 100}%
            </text>
          </g>
        ))}

        {filled.map((b) => (
          <g key={b.index}>
            <rect
              x={x(b.lower) + 1}
              width={Math.max(x(b.upper) - x(b.lower) - 2, 1)}
              y={y(b.accuracy ?? 0)}
              height={y(0) - y(b.accuracy ?? 0)}
              className="fill-violet/60 stroke-violet"
              strokeWidth="1"
            />
            {/* Gap between what the model claimed and what happened */}
            <line
              x1={x(b.meanConfidence ?? 0)}
              x2={x(b.meanConfidence ?? 0)}
              y1={y(b.accuracy ?? 0)}
              y2={y(b.meanConfidence ?? 0)}
              className="stroke-cyan/70"
              strokeWidth="1.5"
            />
          </g>
        ))}

        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} className="stroke-ink" strokeWidth="1.5" strokeDasharray="5 4" />

        <text x={PAD.left + PLOT / 2} y={SIZE - 6} textAnchor="middle" className="fill-ink-muted text-[11px]">
          Confidence (highest probability)
        </text>
        <text
          transform={`translate(12 ${PAD.top + (SIZE - PAD.top - PAD.bottom) / 2}) rotate(-90)`}
          textAnchor="middle"
          className="fill-ink-muted text-[11px]"
        >
          Accuracy in bin
        </text>
      </svg>
      <figcaption className="mt-2 max-w-md text-sm text-ink-muted">
        Violet bars: how often the model was right. Dashed line: perfect calibration. Cyan ticks: the gap in each bin.
        Bars below the line mean over-confidence.
      </figcaption>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-cyan hover:underline">View as a table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-left">
            <caption className="sr-only">Reliability bins, {label}</caption>
            <thead className="text-ink-muted">
              <tr>
                <th scope="col" className="py-1 pr-3 font-medium">Bin</th>
                <th scope="col" className="py-1 pr-3 font-medium">Count</th>
                <th scope="col" className="py-1 pr-3 font-medium">Avg confidence</th>
                <th scope="col" className="py-1 pr-3 font-medium">Accuracy</th>
                <th scope="col" className="py-1 font-medium">Gap</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((b) => (
                <tr key={b.index} className="border-t border-line">
                  <th scope="row" className="py-1 pr-3 font-normal">
                    {Math.round(b.lower * 100)}–{Math.round(b.upper * 100)}%
                  </th>
                  <td className="py-1 pr-3">{b.count}</td>
                  <td className="py-1 pr-3">{b.meanConfidence === null ? "–" : pct(b.meanConfidence)}</td>
                  <td className="py-1 pr-3">{b.accuracy === null ? "–" : pct(b.accuracy)}</td>
                  <td className="py-1">{b.gap === null ? "–" : pct(b.gap)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
