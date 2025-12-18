type Props = {
  wisdom: number;
  onStartRun: () => void;
};

export default function UpgradesPage({ wisdom, onStartRun }: Props) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col">
      <div className="p-6 text-sm text-slate-400">
        Wisdom: <span className="text-slate-100 font-mono">{wisdom}</span>
      </div>

      <div className="flex-1 flex items-center justify-center text-slate-500">
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
