import { useState } from "react";
import type { Card } from "../engine/card";
import { buildDeck } from "../engine/simulator";
import { useEquity } from "../hooks/useEquity";

const HERO_CARDS: Card[] = [
  { rank: "A", suit: "H" },
  { rank: "A", suit: "C" }
];

export default function PokerPage() {
  const [board, setBoard] = useState<Card[]>([]);
  const [opponents] = useState(1);

  const { equity, isComputing } = useEquity(
    HERO_CARDS,
    board,
    opponents
  );

  function reset() {
    setBoard([]);
  }

  function addBoardCard() {
    if (board.length >= 5) return;

    const deck = buildDeck();
    const used = new Set(
      [...HERO_CARDS, ...board].map(c => `${c.rank}${c.suit}`)
    );

    const remaining = deck.filter(
      c => !used.has(`${c.rank}${c.suit}`)
    );

    const next =
      remaining[Math.floor(Math.random() * remaining.length)];

    setBoard([...board, next]);
  }

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h2>Poker Equity Sandbox</h2>

      <div>
        <strong>Hero:</strong>{" "}
        {HERO_CARDS.map(c => `${c.rank}${c.suit}`).join(" ")}
      </div>

      <div>
        <strong>Board:</strong>{" "}
        {board.length === 0
          ? "(empty)"
          : board.map(c => `${c.rank}${c.suit}`).join(" ")}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={addBoardCard}>
          Add Board Card
        </button>{" "}
        <button onClick={reset}>
          Reset
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Equity:</strong>
        {isComputing && <div>Computing...</div>}
        {equity && (
          <ul>
            <li>Win: {(equity.win * 100).toFixed(2)}%</li>
            <li>Tie: {(equity.tie * 100).toFixed(2)}%</li>
            <li>Loss: {(equity.loss * 100).toFixed(2)}%</li>
          </ul>
        )}
      </div>
    </div>
  );
}
