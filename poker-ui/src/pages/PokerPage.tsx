import type { Card } from "../engine/card";
import { PlayingCard } from "../components/ui/cards/PlayingCard";
import { usePokerGame } from "../game/usePokerGame";
import { useEquity } from "../hooks/useEquity";
import { useState} from 'react'
import ratImage from "../assets/rat.jpg";
import dogImage from "../assets/dog.jpg";

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
  opponentChips,
  turn,
  equity,
  isComputing,
  onAddBoardCard,
  onReset,
}: {
  pot: number;
  boardCount: number;
  heroChips: number;
  opponentChips: number;
  turn: "hero" | "opponent";
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

type Props = {
  onReturnToUpgrades: () => void;
};

export default function PokerPage({ onReturnToUpgrades }: Props) {
  const {
    hero,
    opponent,
    board,
    pot,
    turn,
    showdown,
    showdownResult,
    matchOutcome,
    canCheck,
    canCall,
    canBet,
    actions,
  } = usePokerGame();

  // Equity is informational: hero.cards + board vs 1 opponent
  const { equity, isComputing } = useEquity(hero.cards, board, 1);

  const [showDevPanel, setShowDevPanel] = useState(true);
  const [opponentStage, setOpponentStage] = useState<"rat" | "dog">("rat");

  const boardSlots = Array.from({ length: 5 }, (_, i) => board[i] ?? null);

  const baseBtn =
    "px-7 py-3 rounded-xl font-semibold shadow-md transition-all duration-150 active:scale-[0.97]";

  const showdownWinnerLabel =
    showdownResult?.winner === "tie"
      ? "Tie"
      : showdownResult?.winner === "hero"
      ? "Hero"
      : "Opponent";

  const showdownWinnerCombo =
    showdownResult?.winner === "tie"
      ? "Split pot"
      : showdownResult?.winner === "hero"
      ? showdownResult?.hero.type
      : showdownResult?.opponent.type;

  const opponentProfile =
    opponentStage === "rat"
      ? { name: "Rat", image: ratImage, winCopy: "You beat the rat" }
      : { name: "Dog", image: dogImage, winCopy: "You beat the dog" };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center">
      <img
        src={opponentProfile.image}
        alt={`${opponentProfile.name} opponent`}
        className="absolute top-6 left-6 h-24 w-24 rounded-lg object-cover shadow-lg z-50"
      />
      <button
        onClick={() => setShowDevPanel((v) => !v)}
        className="absolute top-6 right-6 px-3 py-1 rounded bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 z-50"
      >
        {showDevPanel ? "Hide Dev UI" : "Show Dev UI"}
      </button>
      <div className="relative w-[92vw] h-[92vh]">
        {/* TABLE SURFACE */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl" />

        {matchOutcome && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80">
            <div className="w-80 rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center shadow-xl">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                {matchOutcome === "opponent_bust" ? "Victory" : "Defeat"}
              </div>
              <div className="mt-3 text-lg font-semibold">
                {matchOutcome === "opponent_bust" ? opponentProfile.winCopy : "You lost"}
              </div>
              {matchOutcome === "opponent_bust" ? (
                <button
                  onClick={() => {
                    if (opponentStage === "rat") {
                      setOpponentStage("dog");
                    }
                    actions.startNewOpponent();
                  }}
                  className="mt-5 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-500"
                >
                  Proceed
                </button>
              ) : (
                <button
                  onClick={onReturnToUpgrades}
                  className="mt-5 w-full rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-600"
                >
                  Return to upgrades
                </button>
              )}
            </div>
          </div>
        )}

        {showdown && showdownResult && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-50 w-72 rounded-xl bg-slate-950/95 border border-slate-700 p-4 shadow-lg">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Showdown
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Hero</span>
                <span className="font-mono">{showdownResult.hero.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Opponent</span>
                <span className="font-mono">{showdownResult.opponent.type}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Winner</span>
                <span className="font-mono">
                  {showdownWinnerLabel} ({showdownWinnerCombo})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pot</span>
                <span className="font-mono">
                  {pot} {"->"} {showdownResult.winner === "tie" ? "Split" : showdownWinnerLabel}
                </span>
              </div>
            </div>
            <button
              onClick={actions.resolveShowdown}
              className="mt-3 w-full px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-semibold"
            >
              Proceed
            </button>
          </div>
        )}

        {/* CONTROL PANEL (TOP RIGHT) */}
        {showDevPanel && (
          <ControlPanel
            pot={pot}
              boardCount={board.length}
              heroChips={hero.chips}
              opponentChips={opponent.chips}
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
          <div className="text-sm text-slate-300">{opponentProfile.name}</div>

          <div className="flex items-center gap-4">
            <PlayingCard card={opponent.hands[0]?.[0] ?? null} faceDown={!showdown} />
            <PlayingCard card={opponent.hands[0]?.[1] ?? null} faceDown={!showdown} />

            <div className="text-xs text-slate-400">
              Chips: <span className="font-mono text-slate-100">{opponent.chips}</span>
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

