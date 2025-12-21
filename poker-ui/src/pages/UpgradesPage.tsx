type Props = {
  wisdom: number;
  onStartRun: () => void;
};

export default function UpgradesPage({ wisdom, onStartRun }: Props) {
  return (
    <div className="min-h-screen w-full felt-texture text-slate-100 flex flex-col">
      <div className="p-6 text-center space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Upgrade Shop</h1>
        <p className="text-sm text-slate-300">Spend your wisdom to gain an edge.</p>
      </div>

      <div className="flex justify-center">
        <div className="wood-panel rounded-2xl px-8 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-900/60 border border-emerald-800/70 flex items-center justify-center text-sm">
            W
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-slate-300">Wisdom</p>
            <p className="text-3xl font-semibold gold-text">{wisdom}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center text-slate-300">
        Upgrades coming soon
      </div>

      <div className="p-6 flex justify-center">
        <button
          onClick={onStartRun}
          className="px-10 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-black font-semibold transition-all"
        >
          Start Run
        </button>
      </div>
    </div>
  );
}
