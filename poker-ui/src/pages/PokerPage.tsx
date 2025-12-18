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

const HERO_CARDS: Card[] = [
  { rank: "K", suit: "H" },
  { rank: "A", suit: "C" },
];

export default function PokerPage() {
  const [board, setBoard] = useState<Card[]>([]);
  const [opponents] = useState(1);

  const { equity, isComputing } = useEquity(HERO_CARDS, board, opponents);

  function reset() {
    setBoard([]);
  }

  function addBoardCard() {
    if (board.length >= 5) return;

    const deck = buildDeck();
    const used = new Set([...HERO_CARDS, ...board].map((c) => `${c.rank}${c.suit}`));

    const remaining = deck.filter((c) => !used.has(`${c.rank}${c.suit}`));
    const next = remaining[Math.floor(Math.random() * remaining.length)];

    setBoard([...board, next]);
  }
  const boardSlots = Array.from({ length: 5 }, (_, i) => board[i] ?? null);
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100">
      <div className="min-h-screen w-full p-6 flex flex-col">
        <h2 className="text-2xl font-semibold">Poker Equity Sandbox</h2>

        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Hero</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            <div className="flex gap-3">
              <PlayingCard card={HERO_CARDS[0]} />
              <PlayingCard card={HERO_CARDS[1]} />
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Board</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            

            <div className="flex gap-3">
              {boardSlots.map((c, i) => (
                <PlayingCard key={i} card={c} />
              ))}
            </div>


            <div className="mt-4 flex gap-3">
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

        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Equity</UiCardTitle>
          </UiCardHeader>
          <UiCardContent>
            {isComputing && <div>Computing...</div>}

            {equity && (
              <ul className="mt-2 space-y-1">
                <li>Win: {(equity.win * 100).toFixed(2)}%</li>
                <li>Tie: {(equity.tie * 100).toFixed(2)}%</li>
                <li>Loss: {(equity.loss * 100).toFixed(2)}%</li>
              </ul>
            )}

            {!isComputing && !equity && (
              <div className="text-slate-400">Add board cards to compute equity.</div>
            )}
          </UiCardContent>
        </UiCard>
      </div>
    </div>
  );
}
