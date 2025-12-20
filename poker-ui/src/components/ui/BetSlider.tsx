import { useEffect, useMemo, useState } from "react";

type Props = {
  chips: number;
  minIncrement?: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
};

function formatChips(amount: number) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return `${amount}`;
}

function computeStep(chips: number, minIncrement: number) {
  if (chips <= minIncrement) return chips;
  let step = minIncrement;
  while (Math.floor(chips / step) > 10) {
    step *= 2;
  }
  return step;
}

function buildTicks(chips: number, step: number) {
  if (chips <= step) return [chips];
  const count = Math.floor(chips / step);
  const ticks = Array.from({ length: count }, (_, i) => (i + 1) * step);
  if (ticks[ticks.length - 1] !== chips) {
    ticks.push(chips);
  }
  return ticks;
}

export function BetSlider({ chips, minIncrement = 50, onConfirm, onCancel }: Props) {
  const step = useMemo(() => computeStep(chips, minIncrement), [chips, minIncrement]);
  const ticks = useMemo(() => buildTicks(chips, step), [chips, step]);
  const min = ticks[0] ?? 0;
  const max = chips;
  const [value, setValue] = useState(min);

  useEffect(() => {
    setValue((v) => Math.min(Math.max(v, min), max));
  }, [min, max]);

  const valueLabel = value >= max ? "All In" : formatChips(value);

  return (
    <div className="w-[360px] rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            Bet Size
          </div>
          <div className="mt-1 text-lg font-semibold">{valueLabel}</div>
        </div>
        <button
          onClick={onCancel}
          className="h-7 w-7 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700"
          aria-label="Cancel bet sizing"
        >
          X
        </button>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          {ticks.map((tick, index) => (
            <span key={tick}>
              {index === ticks.length - 1 ? "Max" : formatChips(tick)}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onConfirm(value)}
        className="mt-4 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-500"
      >
        Place bet
      </button>
    </div>
  );
}
