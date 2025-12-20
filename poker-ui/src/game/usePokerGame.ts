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

type MatchOutcome = "hero_bust" | "opponent_bust";

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
  const [matchOutcome, setMatchOutcome] = useState<MatchOutcome | null>(null);

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
    setMatchOutcome(null);

    setHero((h) => ({ ...h, bet: 0, cards: heroCards }));
    setOpponent((o) => ({ ...o, bet: 0, hands: [opponentCards] }));
  }

  function startNewOpponent() {
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
    setMatchOutcome(null);

    setHero((h) => ({ ...h, bet: 0, cards: heroCards }));
    setOpponent({
      chips: STARTING_CHIPS,
      bet: 0,
      hands: [opponentCards],
    });
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

  const canCheck = turn === "hero" && heroToCall === 0 && !showdown && !matchOutcome;
  const canCall =
    turn === "hero" && heroToCall > 0 && hero.chips >= heroToCall && !showdown && !matchOutcome;
  const canBet = turn === "hero" && hero.chips > 0 && !showdown && !matchOutcome;

  // =========================
  // HERO ACTIONS
  // =========================
  function check() {
    if (matchOutcome) return;
    if (!canCheck) return;
    setTurn("opponent");
  }

  function call() {
    if (matchOutcome) return;
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
    if (matchOutcome) return;
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
    if (matchOutcome) return;
    if (showdown) return;
    const nextHeroChips = hero.chips;
    const nextOpponentChips = opponent.chips + pot;

    setOpponent((o) => ({ ...o, chips: nextOpponentChips }));
    setPot(0);
    setCurrentBet(0);
    setShowdown(false);
    setShowdownResult(null);

    if (nextHeroChips <= 0) {
      setMatchOutcome("hero_bust");
      return;
    }

    resetHand();
  }

  // =========================
  // OPPONENT AI (TEMP: CALL IF NEEDED, ELSE CHECK)
  // =========================
  useEffect(() => {
    if (turn !== "opponent") return;
    if (showdown) return;
    if (matchOutcome) return;

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
  }, [turn, currentBet, opponent.bet, opponent.chips, opponent, showdown, matchOutcome, board, hero, pot]);

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

    let nextHeroChips = hero.chips;
    let nextOpponentChips = opponent.chips;

    if (showdownResult.winner === "hero") {
      nextHeroChips = hero.chips + pot;
      setHero((h) => ({ ...h, chips: nextHeroChips }));
    } else if (showdownResult.winner === "opponent") {
      nextOpponentChips = opponent.chips + pot;
      setOpponent((o) => ({ ...o, chips: nextOpponentChips }));
    } else {
      nextHeroChips = hero.chips + pot / 2;
      nextOpponentChips = opponent.chips + pot / 2;
      setHero((h) => ({ ...h, chips: nextHeroChips }));
      setOpponent((o) => ({ ...o, chips: nextOpponentChips }));
    }

    setPot(0);
    setCurrentBet(0);
    setShowdown(false);
    setShowdownResult(null);

    if (nextHeroChips <= 0) {
      setMatchOutcome("hero_bust");
      return;
    }

    if (nextOpponentChips <= 0) {
      setMatchOutcome("opponent_bust");
      return;
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
    matchOutcome,

    canCheck,
    canCall,
    canBet,

    actions: {
      check,
      call,
      bet,
      fold,
      resetHand,
      startNewOpponent,
      addBoardCard,
      resolveShowdown,
    },
  };
}
