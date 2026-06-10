import { useState } from "react";
import { formatINR } from "../../lib/format.js";

const MIN = 25000;
const MAX = 150000;
const STEP = 5000;

export default function LimitSlider() {
  const [value, setValue] = useState(50000);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">Try a smaller limit</span>
        <span className="text-lg font-semibold tabular-nums text-ink">{formatINR(value)}</span>
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Adjust requested limit"
        className="mt-3 w-full accent-caution-500"
      />
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-slate-400">
        <span>{formatINR(MIN)}</span>
        <span>{formatINR(MAX)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        A lower amount may be easier to service. Check your eligibility instantly.
      </p>
    </div>
  );
}
