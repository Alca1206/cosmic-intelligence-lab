import type { Metrics } from "@/lib/ml/types";

type Props = {
  raw: Metrics;
  current: Metrics;
  fitted: Metrics;
  temperature: number;
  fittedTemperature: number;
};

const rows: { key: "accuracy" | "meanConfidence" | "ece" | "brier" | "nll"; label: string; better: "higher" | "lower" | "none" }[] = [
  { key: "accuracy", label: "Accuracy", better: "none" },
  { key: "meanConfidence", label: "Mean confidence", better: "none" },
  { key: "ece", label: "ECE", better: "lower" },
  { key: "brier", label: "Brier score", better: "lower" },
  { key: "nll", label: "NLL", better: "lower" },
];

const fmt = (key: string, v: number) =>
  key === "accuracy" || key === "meanConfidence" ? `${(v * 100).toFixed(1)}%` : v.toFixed(4);

export default function MetricsPanel({ raw, current, fitted, temperature, fittedTemperature }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] text-left text-sm">
        <caption className="sr-only">
          Metrics for the original model, the chosen temperature, and the fitted temperature
        </caption>
        <thead className="text-ink-muted">
          <tr>
            <th scope="col" className="py-2 pr-4 font-medium">Metric</th>
            <th scope="col" className="py-2 pr-4 font-medium">Original (T = 1)</th>
            <th scope="col" className="py-2 pr-4 font-medium text-cyan">Your T = {temperature.toFixed(2)}</th>
            <th scope="col" className="py-2 pr-4 font-medium">Change</th>
            <th scope="col" className="py-2 font-medium">Fitted (T = {fittedTemperature.toFixed(2)})</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, label, better }) => {
            const delta = current[key] - raw[key];
            const improved = better === "lower" && delta < -1e-9;
            const worse = better === "lower" && delta > 1e-9;
            const unit = key === "accuracy" || key === "meanConfidence" ? " pts" : "";
            const shown = unit ? delta * 100 : delta;
            return (
              <tr key={key} className="border-t border-line">
                <th scope="row" className="py-2 pr-4 font-normal">{label}</th>
                <td className="py-2 pr-4 tabular-nums">{fmt(key, raw[key])}</td>
                <td className="py-2 pr-4 tabular-nums text-ink">{fmt(key, current[key])}</td>
                <td
                  className={`py-2 pr-4 tabular-nums ${improved ? "text-cyan" : worse ? "text-violet" : "text-ink-muted"}`}
                >
                  {Math.abs(delta) < 1e-9 ? "no change" : `${shown > 0 ? "+" : ""}${shown.toFixed(unit ? 1 : 4)}${unit}`}
                  {improved ? " (better)" : worse ? " (worse)" : ""}
                </td>
                <td className="py-2 tabular-nums">{fmt(key, fitted[key])}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-ink-muted">
        Computed in your browser from the stored model outputs for {raw.count.toLocaleString()} held-out images, using{" "}
        {raw.bins} bins. Lower is better for ECE, Brier and NLL.
      </p>
    </div>
  );
}
