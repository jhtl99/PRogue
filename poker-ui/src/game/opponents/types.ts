import type { Card } from "../../engine/card";

export type OpponentState = {
  chips: number;
  bet: number;
  hands: Card[][];
};

export type OpponentAction =
  | { type: "check" }
  | { type: "call" }
  | { type: "fold" }
  | { type: "bet"; amount: number };

export type OpponentDecisionContext = {
  toCall: number;
  currentBet: number;
  pot: number;
  board: Card[];
  hero: {
    chips: number;
    bet: number;
    cards: Card[];
  };
  opponent: OpponentState;
};

export type OpponentBehavior = (ctx: OpponentDecisionContext) => OpponentAction;
