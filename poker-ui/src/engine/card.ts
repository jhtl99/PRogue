import { RANK_VALUE } from "./constants";

export interface Card {
  rank: string;
  suit: string;
}

export function cardValue(card: Card): number {
  return RANK_VALUE[card.rank];
}
