import { useEffect, useState } from "react";
import type { Card } from "../engine/card";
import { buildDeck } from "../engine/simulator";
import { evaluateHand } from "../engine/handEvaluator";
import type { HandResult } from "../engine/handResult";
import { ratBehavior } from "./opponents/ratBehavior";
import type { OpponentState } from "./opponents/types";

type PlayerId = "hero" | "opponent";

type PlayerState = {
  chips: number;
  bet: number;
  cards: Card[];
};

const STARTING_CHIPS = 1000;

type ShowdownWinner = PlayerId | "tie";

type ShowdownResult = {
  hero: HandResult;
  opponent: HandResult;
  winner: ShowdownWinner;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function usePokerGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [turn, setTurn] = useState<PlayerId>("hero");
  const [showdown, setShowdown] = useState(false);
  const [showdownResult, setShowdownResult] = useState<ShowdownResult | null>(
    null
  );

  const [hero, setHero] = useState<PlayerState>({
    chips: STARTING_CHIPS,
    bet: 0,
    cards: [],
  });

  const [opponent, setOpponent] = useState<OpponentState>({
    chips: STARTING_CHIPS,
    bet: 0,
    hands: [],
  });

  // =========================
  // RESET / DEAL
  // =========================
  function resetHand() {
    const newDeck = shuffle(buildDeck());
    const heroCards = newDeck.splice(0, 2);
    const opponentCards = newDeck.splice(0, 2);

    setDeck(newDeck);
    setBoard([]);
    setPot(0);
    setCurrentBet(0);
    setTurn("hero");
    setShowdown(false);
    setShowdownResult(null);

    setHero((h) => ({ ...h, bet: 0, cards: heroCards }));
    setOpponent((o) => ({ ...o, bet: 0, hands: [opponentCards] }));
  }

  // Initial deal once on mount
  useEffect(() => {
    resetHand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // DERIVED LEGALITY (HERO)
  // =========================
  const heroToCall = currentBet - hero.bet;

  const canCheck = turn === "hero" && heroToCall === 0 && !showdown;
  const canCall = turn === "hero" && heroToCall > 0 && hero.chips >= heroToCall && !showdown;
  const canBet = turn === "hero" && hero.chips > 0 && !showdown;

  // =========================
  // HERO ACTIONS
  // =========================
  function check() {
    if (!canCheck) return;
    setTurn("opponent");
  }

  function call() {
    if (!canCall) return;

    setHero((h) => ({
      ...h,
      chips: h.chips - heroToCall,
      bet: h.bet + heroToCall,
    }));
    setPot((p) => p + heroToCall);

    setTurn("opponent");
  }

  function bet(amount: number) {
    if (!canBet) return;
    if (amount <= 0) return;
    if (hero.chips < amount) return;

    setHero((h) => ({
      ...h,
      chips: h.chips - amount,
      bet: h.bet + amount,
    }));

    setCurrentBet(hero.bet + amount);
    setPot((p) => p + amount);

    setTurn("opponent");
  }

  function fold() {
    if (showdown) return;
    setOpponent((o) => ({ ...o, chips: o.chips + pot }));
    resetHand();
  }

  // =========================
  // OPPONENT AI (TEMP: CALL IF NEEDED, ELSE CHECK)
  // =========================
  useEffect(() => {
    if (turn !== "opponent") return;
    if (showdown) return;

    const opponentToCall = currentBet - opponent.bet;

    const timer = setTimeout(() => {
      const action = ratBehavior({
        toCall: opponentToCall,
        currentBet,
        pot,
        board,
        hero,
        opponent,
      });

      if (action.type === "fold") {
        setHero((h) => ({ ...h, chips: h.chips + pot }));
        resetHand();
        return;
      }

      if (action.type === "check") {
        setTurn("hero");
        return;
      }

      if (action.type === "call") {
        if (opponentToCall > 0 && opponent.chips >= opponentToCall) {
          setOpponent((o) => ({
            ...o,
            chips: o.chips - opponentToCall,
            bet: o.bet + opponentToCall,
          }));
          setPot((p) => p + opponentToCall);
        }

        setTurn("hero");
        return;
      }

      if (action.type === "bet") {
        const amount = action.amount;
        if (amount > 0 && opponent.chips >= amount) {
          setOpponent((o) => ({
            ...o,
            chips: o.chips - amount,
            bet: o.bet + amount,
          }));
          setCurrentBet(opponent.bet + amount);
          setPot((p) => p + amount);
        }

        setTurn("hero");
        return;
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [turn, currentBet, opponent.bet, opponent.chips, opponent, showdown, board, hero, pot]);

  // =========================
  // BOARD CONTROL (DEBUG)
  // =========================
  function addBoardCard() {
    if (board.length >= 5) return;
    if (deck.length === 0) return;

    const next = deck[0];
    setBoard((b) => [...b, next]);
    setDeck((d) => d.slice(1));
    }


  // =========================
  // SHOWDOWN: REVEAL + PAY + RESET
  // =========================
  useEffect(() => {
    if (board.length !== 5) return;

    setShowdown(true);

    const heroResult = evaluateHand([...hero.cards, ...board]);
    const opponentHand = opponent.hands[0] ?? [];
    const opponentResult = evaluateHand([...opponentHand, ...board]);

    let winner: ShowdownWinner = "tie";
    if (heroResult.beats(opponentResult)) {
      winner = "hero";
    } else if (opponentResult.beats(heroResult)) {
      winner = "opponent";
    }

    setShowdownResult({
      hero: heroResult,
      opponent: opponentResult,
      winner,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.length]);

  function resolveShowdown() {
    if (!showdownResult) return;

    if (showdownResult.winner === "hero") {
      setHero((h) => ({ ...h, chips: h.chips + pot }));
    } else if (showdownResult.winner === "opponent") {
      setOpponent((o) => ({ ...o, chips: o.chips + pot }));
    } else {
      setHero((h) => ({ ...h, chips: h.chips + pot / 2 }));
      setOpponent((o) => ({ ...o, chips: o.chips + pot / 2 }));
    }

    resetHand();
  }

  return {
    hero,
    opponent,
    board,
    pot,
    turn,
    showdown,
    showdownResult,

    canCheck,
    canCall,
    canBet,

    actions: {
      check,
      call,
      bet,
      fold,
      resetHand,
      addBoardCard,
      resolveShowdown,
    },
  };
}
