import { estimateEquity } from "../../engine/simulator";
import type { OpponentBehavior } from "./types";

function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function roundToIncrement(amount: number, increment: number) {
  return Math.max(increment, Math.round(amount / increment) * increment);
}

export const ratBehavior: OpponentBehavior = ({ toCall, board, opponent }) => {
  const hand = opponent.hands[0] ?? [];
  if (hand.length < 2) {
    return { type: "check" };
  }

  const equity = estimateEquity(hand, board, 1, 1500);
  const strength = equity.win + equity.tie * 0.5;

  if (toCall > 0) {
    const pressure = toCall / Math.max(opponent.chips, 1);
    if (strength < 0.35 && pressure > 0.25) {
      return { type: "fold" };
    }
    return { type: "call" };
  }

  if (strength > 0.6 && opponent.chips > 0) {
    const target = roundToIncrement(opponent.chips * 0.2, 50);
    const amount = clamp(50, target, opponent.chips);
    if (amount > 0) {
      return { type: "bet", amount };
    }
  }

  return { type: "check" };
};
