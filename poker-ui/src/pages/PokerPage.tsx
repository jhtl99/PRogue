import type { Card } from "../engine/card";
import { PlayingCard } from "../components/ui/cards/PlayingCard";
import { usePokerGame } from "../game/usePokerGame";
import { useEquity } from "../hooks/useEquity";
import { useState} from 'react'

function MockDeck() {
  const dummyCard: Card = { rank: "B", suit: "S" };

  return (
    <div className="relative w-16 h-24">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute"
          style={{ transform: `translate(${i * -3}px, ${i * -3}px)` }}
        >
          <PlayingCard card={dummyCard} faceDown />
        </div>
      ))}
    </div>
  );
}

function BurnPile({ boardCount }: { boardCount: number }) {
  const dummyCard: Card = { rank: "A", suit: "S" };
  if (boardCount === 0) return <PlayingCard card={null} />;
  return <PlayingCard card={dummyCard} faceDown />;
}

function PotDisplay({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-wide">Pot</span>
      <span className="text-2xl font-semibold text-emerald-400">{amount}</span>
    </div>
  );
}

function ControlPanel({
  pot,
  boardCount,
  heroChips,
  ratChips,
  turn,
  equity,
  isComputing,
  onAddBoardCard,
  onReset,
}: {
  pot: number;
  boardCount: number;
  heroChips: number;
  ratChips: number;
  turn: "hero" | "rat";
  equity: { win: number; tie: number; loss: number } | null;
  isComputing: boolean;
  onAddBoardCard: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute top-6 right-6 w-72 space-y-4 text-sm z-50">
      {/* BOARD CONTROLS */}
      <div className="flex gap-2">
        <button
          onClick={onAddBoardCard}
          className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-black"
        >
          Add Card
        </button>

        <button
          onClick={onReset}
          className="flex-1 px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-black"
        >
          Reset
        </button>
      </div>

      {/* GAME STATE */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">Turn</span>
          <span className="font-mono">{turn}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Pot</span>
          <span className="font-mono">{pot}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">Board</span>
          <span className="font-mono">{boardCount} / 5</span>
        </div>
      </div>


      {/* EQUITY */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Equity</span>
          <span className="font-mono text-xs">1 opp</span>
        </div>

        {isComputing ? (
          <div className="text-slate-500">Computing…</div>
        ) : equity ? (
          <ul className="font-mono text-xs space-y-0.5">
            <li>Win: {(equity.win * 100).toFixed(1)}%</li>
            <li>Tie: {(equity.tie * 100).toFixed(1)}%</li>
            <li>Lose: {(equity.loss * 100).toFixed(1)}%</li>
          </ul>
        ) : (
          <div className="text-slate-500">Add board cards</div>
        )}
      </div>
    </div>
  );
}

export default function PokerPage() {
  const {
    hero,
    rat,
    board,
    pot,
    turn,
    showdown,
    canCheck,
    canCall,
    canBet,
    actions,
  } = usePokerGame();

  // Equity is informational: hero.cards + board vs 1 opponent
  const { equity, isComputing } = useEquity(hero.cards, board, 1);

  const [showDevPanel, setShowDevPanel] = useState(true);

  const boardSlots = Array.from({ length: 5 }, (_, i) => board[i] ?? null);

  const baseBtn =
    "px-7 py-3 rounded-xl font-semibold shadow-md transition-all duration-150 active:scale-[0.97]";

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="relative w-[92vw] h-[92vh]">
        {/* TABLE SURFACE */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl" />
          <button
            onClick={() => setShowDevPanel((v) => !v)}
            className="absolute top-6 left-6 px-3 py-1 rounded bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 z-50"
          >
            {showDevPanel ? "Hide Dev UI" : "Show Dev UI"}
          </button>

          {/* CONTROL PANEL (TOP RIGHT) */}
          {showDevPanel && (
            <ControlPanel
              pot={pot}
              boardCount={board.length}
              heroChips={hero.chips}
              ratChips={rat.chips}
              turn={turn}
              equity={equity}
              isComputing={isComputing}
              onAddBoardCard={actions.addBoardCard}
              onReset={actions.resetHand}
              // onToggleReveal={actions.toggleReveal}
            />
          )}


        {/* OPPONENT (TOP) */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="text-sm text-slate-300">Rat 1</div>

          <div className="flex items-center gap-4">
            <PlayingCard card={rat.cards[0]} faceDown={!showdown} />
            <PlayingCard card={rat.cards[1]} faceDown={!showdown} />

            <div className="text-xs text-slate-400">
              Chips: <span className="font-mono text-slate-100">{rat.chips}</span>
            </div>
          </div>
        </div>


        {/* DECK + BURN (LEFT OF BOARD) */}
        <div className="absolute top-1/3 left-1/2 -translate-x-[300px]">
          <MockDeck />
        </div>

        <div className="absolute top-1/3 left-1/2 translate-y-[120px] -translate-x-[300px] brightness-75">
          <BurnPile boardCount={board.length} />
        </div>

        {/* POT (RIGHT) */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <PotDisplay amount={pot} />
        </div>

        {/* BOARD (CENTER) */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-3">
          {boardSlots.map((c, i) => (
            <PlayingCard key={i} card={c} />
          ))}
        </div>

        {/* ACTION BUTTONS (BOTTOM CENTER) */}
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 flex gap-4">
          <button
            disabled={!canCheck}
            onClick={actions.check}
            className={`${baseBtn} text-black ${
              canCheck ? "bg-slate-600 hover:bg-slate-500" : "opacity-40 cursor-not-allowed bg-slate-600"
            }`}
          >
            Check
          </button>

          <button
            disabled={!canCall}
            onClick={actions.call}
            className={`${baseBtn} text-black ${
              canCall ? "bg-emerald-600 hover:bg-emerald-500" : "opacity-40 cursor-not-allowed bg-emerald-600"
            }`}
          >
            Call
          </button>

          <button
            disabled={!canBet}
            onClick={() => actions.bet(100)}
            className={`${baseBtn} text-black ${
              canBet ? "bg-blue-600 hover:bg-blue-500" : "opacity-40 cursor-not-allowed bg-blue-600"
            }`}
          >
            Bet 100
          </button>

          <button
            onClick={actions.fold}
            className={`${baseBtn} bg-red-600 hover:bg-red-500 text-black`}
          >
            Fold
          </button>
        </div>

        {/* HERO (BOTTOM) */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6">
          <PlayingCard card={hero.cards[0]} />
          <PlayingCard card={hero.cards[1]} />

          <div className="text-xs text-slate-400">
            Chips: <span className="font-mono text-slate-100">{hero.chips}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
