import { useEffect, useState } from "react";
import type { Card } from "../engine/card";
import { buildDeck } from "../engine/simulator";
import { evaluateHand } from "../engine/handEvaluator";

type PlayerId = "hero" | "rat";

type PlayerState = {
  chips: number;
  bet: number;
  cards: Card[];
};

const STARTING_CHIPS = 1000;

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

  const [hero, setHero] = useState<PlayerState>({
    chips: STARTING_CHIPS,
    bet: 0,
    cards: [],
  });

  const [rat, setRat] = useState<PlayerState>({
    chips: STARTING_CHIPS,
    bet: 0,
    cards: [],
  });

  // =========================
  // RESET / DEAL
  // =========================
  function resetHand() {
    const newDeck = shuffle(buildDeck());
    const heroCards = newDeck.splice(0, 2);
    const ratCards = newDeck.splice(0, 2);

    setDeck(newDeck);
    setBoard([]);
    setPot(0);
    setCurrentBet(0);
    setTurn("hero");
    setShowdown(false);

    setHero((h) => ({ ...h, bet: 0, cards: heroCards }));
    setRat((r) => ({ ...r, bet: 0, cards: ratCards }));
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
    setTurn("rat");
  }

  function call() {
    if (!canCall) return;

    setHero((h) => ({
      ...h,
      chips: h.chips - heroToCall,
      bet: h.bet + heroToCall,
    }));
    setPot((p) => p + heroToCall);

    setTurn("rat");
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

    setTurn("rat");
  }

  function fold() {
    if (showdown) return;
    setRat((r) => ({ ...r, chips: r.chips + pot }));
    resetHand();
  }

  // =========================
  // RAT AI (TEMP: CALL IF NEEDED, ELSE CHECK)
  // =========================
  useEffect(() => {
    if (turn !== "rat") return;
    if (showdown) return;

    const ratToCall = currentBet - rat.bet;

    const timer = setTimeout(() => {
      if (ratToCall > 0 && rat.chips >= ratToCall) {
        setRat((r) => ({
          ...r,
          chips: r.chips - ratToCall,
          bet: r.bet + ratToCall,
        }));
        setPot((p) => p + ratToCall);
      }

      setTurn("hero");
    }, 600);

    return () => clearTimeout(timer);
  }, [turn, currentBet, rat.bet, rat.chips, showdown]);

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
    const ratResult = evaluateHand([...rat.cards, ...board]);

    if (heroResult.ranks >= ratResult.ranks) {
      setHero((h) => ({ ...h, chips: h.chips + pot }));
    } else {
      setRat((r) => ({ ...r, chips: r.chips + pot }));
    }

    const timer = setTimeout(() => {
      resetHand(); // new cards after payout
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.length]);

  return {
    hero,
    rat,
    board,
    pot,
    turn,
    showdown,

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
    },
  };
}
