type Props = {
  onBegin: () => void;
};

export default function LandingPage({ onBegin }: Props) {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-5xl font-semibold tracking-wide">stray flush</h1>

        <button
          onClick={onBegin}
          className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold transition-all"
        >
          Begin
        </button>
      </div>
    </div>
  );
}
