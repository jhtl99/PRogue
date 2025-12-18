// engine/simulator.ts

import type { Card } from "./card";
import { evaluateHand } from "./handEvaluator";
import { HandResult } from "./handResult";

/**
 * =========================
 * CONFIGURATION
 * =========================
 * Adjust this to trade speed vs accuracy
 */
export const NUM_TRIALS = 5000;

/**
 * Fisher–Yates shuffle (in place)
 */
function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Build a full 52-card deck
 */
export function buildDeck(): Card[] {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
  const suits = ["H", "C", "S", "D"];

  const deck: Card[] = [];
  for (const r of ranks) {
    for (const s of suits) {
      deck.push({ rank: r, suit: s });
    }
  }
  return deck;
}

/**
 * Remove used cards from deck
 */
function remainingDeck(deck: Card[], used: Card[]): Card[] {
  const usedSet = new Set(
    used.map(c => `${c.rank}${c.suit}`)
  );
  return deck.filter(c => !usedSet.has(`${c.rank}${c.suit}`));
}

/**
 * =========================
 * MONTE CARLO EQUITY
 * =========================
 */
export function estimateEquity(
  heroCards: Card[],
  boardCards: Card[] = [],
  numOpponents: number = 1,
  trials: number = NUM_TRIALS
): {
  win: number;
  tie: number;
  loss: number;
} {
  let wins = 0;
  let ties = 0;
  let losses = 0;

  const fullDeck = buildDeck();

  for (let t = 0; t < trials; t++) {
    // ---- Build deck ----
    const used = [...heroCards, ...boardCards];
    const deck = remainingDeck(fullDeck, used);

    // ---- Shuffle once ----
    shuffle(deck);

    let idx = 0;

    // ---- Deal opponents ----
    const opponentHands: Card[][] = [];
    for (let i = 0; i < numOpponents; i++) {
      opponentHands.push(deck.slice(idx, idx + 2));
      idx += 2;
    }

    // ---- Complete board ----
    const needed = 5 - boardCards.length;
    const fullBoard = boardCards.concat(deck.slice(idx, idx + needed));

    // ---- Evaluate hero ----
    const heroResult = evaluateHand(heroCards.concat(fullBoard));

    // ---- Evaluate opponents ----
    const oppResults: HandResult[] = opponentHands.map(
      opp => evaluateHand(opp.concat(fullBoard))
    );

    // ---- Determine outcome ----
    let best: HandResult = heroResult;
    let tied = false;

    for (const opp of oppResults) {
      if (opp.beats(best)) {
        best = opp;
        tied = false;
      } else if (opp.equals(best)) {
        tied = true;
      }
    }

    if (best.equals(heroResult)) {
      if (tied) ties++;
      else wins++;
    } else {
      losses++;
    }
  }

  return {
    win: wins / trials,
    tie: ties / trials,
    loss: losses / trials,
  };
}
