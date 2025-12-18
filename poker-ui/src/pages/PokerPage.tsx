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
  const boardSlots = Array.from({ length: 5 }, (_, i) => board[i] ?? null);
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center">
    <div className="w-full max-w-3xl p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Poker Equity Simulation</h2>

        <UiCard className="w-full">
          <UiCardHeader>
            <UiCardTitle>Your Cards</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div className="flex gap-3 justify-center">
              <PlayingCard key={`hero-${heroDealId}-0`} card={heroCards[0]} dealId={heroDealId}/>
              <PlayingCard key={`hero-${heroDealId}-1`} card={heroCards[1]} dealId={heroDealId}/>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard className="w-full">
          <UiCardHeader>
            <UiCardTitle>Board</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            


            <div className="flex gap-3 justify-center">
              {boardSlots.map((c, i) => (
                <PlayingCard key={i} card={c} />
              ))}
            </div>


            <div className="mt-4 flex gap-3 justify-center">
              <button
                onClick={addBoardCard}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Add Board Card
              </button>

              <button
                onClick={reset}
                className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white"
              >
                Reset
              </button>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard className="w-full">
          <UiCardHeader>
            <UiCardTitle>Equity (Approximate)</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>

            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <span className="text-slate-300"># of Opponents</span>
                  <span className="font-mono text-slate-100">{opponentsUI}</span>
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
              <div className="flex justify-between text-xs text-slate-500">
                  {Array.from({ length: 8 }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                  ))}
              </div>
            </div>
            <div className="min-h-[110px] mt-3">
            <div className={isComputing ? "" : "invisible"}>Computing...</div>

            {equity ? (
              <ul className="mt-2 space-y-1">
                <li>Win: {(equity.win * 100).toFixed(2)}%</li>
                <li>Tie: {(equity.tie * 100).toFixed(2)}%</li>
                <li>Loss: {(equity.loss * 100).toFixed(2)}%</li>
              </ul>
            ) : (
              <div className="text-slate-400">Add board cards to compute equity.</div>
            )}
          </div>
          </UiCardContent>
        </UiCard>
      </div>
    </div>
  );
}
