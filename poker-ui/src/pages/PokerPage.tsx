import { useState } from "react";
import type { Card } from "../engine/card";
import { buildDeck } from "../engine/simulator";
import { useEquity } from "../hooks/useEquity";
import { PlayingCard } from "../components/ui/cards/PlayingCard";


import {
  UiCard,
  UiCardHeader,
  UiCardTitle,
  UiCardContent,
} from "../components/ui/ui-card";


function drawWithoutReplacement(deck: Card[], n: number): Card[] {
  const pool = deck.slice(); // copy so we don't mutate the original
  const drawn: Card[] = [];

  for (let k = 0; k < n; k++) {
    const i = Math.floor(Math.random() * pool.length);
    drawn.push(pool[i]);
    pool.splice(i, 1);
  }

  return drawn;
}

function drawRandomHeroCards(): Card[] {
  return drawWithoutReplacement(buildDeck(), 2);
}





export default function PokerPage() {
  const [board, setBoard] = useState<Card[]>([]);
  const [opponentsUI, setOpponentsUI] = useState(1);
  const [opponents, setOpponents] = useState(1);
  const [heroCards, setHeroCards] = useState<Card[]>(() => drawRandomHeroCards());
  const [heroDealId, setHeroDealId] = useState(0);
  const { equity, isComputing } = useEquity(heroCards, board, opponents);

  function reset() {
    setBoard([]);
    setHeroCards(drawRandomHeroCards());
    setHeroDealId((x) => x + 1);
  }

  function handleOpponentsChange(e: React.ChangeEvent<HTMLInputElement>) {
  setOpponents(Number(e.target.value));
}

  function addBoardCard() {
    if (board.length >= 5) return;

    const deck = buildDeck();
    const used = new Set([...heroCards, ...board].map((c) => `${c.rank}${c.suit}`));

    const remaining = deck.filter((c) => !used.has(`${c.rank}${c.suit}`));
    const next = remaining[Math.floor(Math.random() * remaining.length)];

    setBoard([...board, next]);
  }

  function MockDeck() {
    // dummy card object – rank/suit won't be used because faceDown=true
    const dummyCard: Card = { rank: "A", suit: "S" };

    return (
      <div className="relative w-16 h-24">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              transform: `translate(${i * -3}px, ${i * -3}px)`
            }}
          >
            <PlayingCard card={dummyCard} faceDown />
          </div>
        ))}
      </div>
    );
  }


  function PotDisplay({ amount }: { amount: number }) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          Pot
        </span>
        <span className="text-2xl font-semibold text-emerald-400">
          {amount}
        </span>
      </div>
    );
  }

  function ActionBar() {
    return (
      <div className="flex gap-4">
        <button className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-black">
          Check
        </button>

        <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-black">
          Bet
        </button>

        <button className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-black">
          Call
        </button>

        <button className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-black">
          Fold
        </button>
      </div>
    );
  }

  function BurnPile({boardCount}: {boardCount:number}) {
    const dummyCard: Card = { rank: "A", suit: "S" };

    // No board cards → show empty slot
      if (boardCount === 0) {
        return <PlayingCard card={null} />;
      }

    return (
      <div className="relative">
        <PlayingCard card={dummyCard} faceDown />
      </div>
    );
  }



  const boardSlots = Array.from({ length: 5 }, (_, i) => board[i] ?? null);
    return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="relative w-[92vw] h-[92vh] max-w-none">


        

        {/* === TABLE SURFACE === */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl" />


        {/* === DEBUG / SIMULATION CONTROLS (TOP RIGHT) === */}
<div className="absolute top-6 right-6 w-72 space-y-4 text-sm">
  
  {/* BOARD CONTROLS */}
  <div className="flex gap-2">
    <button
      onClick={addBoardCard}
      className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-black"
    >
      Add Card
    </button>

    <button
      onClick={reset}
      className="flex-1 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-black"
    >
      Reset
    </button>
  </div>

  {/* EQUITY */}
  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-400">Equity</span>
      <span className="font-mono">{opponents} opp</span>
    </div>

    {isComputing && (
      <div className="text-slate-500">Computing…</div>
    )}

    {equity ? (
      <ul className="space-y-1 font-mono">
        <li>Win: {(equity.win * 100).toFixed(1)}%</li>
        <li>Tie: {(equity.tie * 100).toFixed(1)}%</li>
        <li>Lose: {(equity.loss * 100).toFixed(1)}%</li>
      </ul>
    ) : (
      <div className="text-slate-500">Add board cards</div>
    )}
  </div>

  {/* OPPONENT SLIDER */}
  <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
    <div className="flex justify-between mb-1">
      <span className="text-slate-400">Opponents</span>
      <span className="font-mono">{opponentsUI}</span>
    </div>

    <input
      type="range"
      min={1}
      max={8}
      step={1}
      value={opponentsUI}
      onChange={(e) => setOpponentsUI(Number(e.target.value))}
      onMouseUp={() => setOpponents(opponentsUI)}
      onTouchEnd={() => setOpponents(opponentsUI)}
      className="w-full"
    />
  </div>
</div>


        {/* === MOCK DECK (LEFT) === */}
        {/* === MOCK DECK (LEFT OF BOARD) === */}
        <div className="absolute top-1/3 left-1/2  -translate-x-[300px]">
          <MockDeck />
        </div>

        {/* === BURN PILE (RIGHT OF BOARD) === */}
        <div className="absolute top-1/3 left-1/2 translate-y-[120px] -translate-x-[300px]">
          <BurnPile boardCount={board.length}/>
        </div>



        {/* === POT (RIGHT) === */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <PotDisplay amount={400} />
        </div>

        {/* === BOARD === */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-3">
          {boardSlots.map((c, i) => (
            <PlayingCard key={i} card={c} />
          ))}
        </div>

        {/* === ACTION BUTTONS === */}
        <div className="absolute bottom-50 left-1/2 -translate-x-1/2">
          <ActionBar />
        </div>

        {/* === HERO CARDS === */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4">
          <PlayingCard
            key={`hero-${heroDealId}-0`}
            card={heroCards[0]}
            dealId={heroDealId}
          />
          <PlayingCard
            key={`hero-${heroDealId}-1`}
            card={heroCards[1]}
            dealId={heroDealId}
          />
        </div>
      </div>
    </div>
  );

}
