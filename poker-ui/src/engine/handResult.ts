import { HAND_RANKINGS } from "./constants";
import type {HandType} from "./constants";
import {cardValue } from "./card";
import type { Card } from "./card";

export class HandResult {
  readonly type: HandType;
  readonly cards: Card[];
  readonly ranks: number[];
  readonly strength: number;

  constructor(type: HandType, cards: Card[]) {
    this.type = type;
    this.cards = cards;
    this.ranks = cards.map(cardValue);
    this.strength = HAND_RANKINGS.indexOf(type);
  }

  beats(other: HandResult): boolean {
    if (this.strength !== other.strength) {
      return this.strength < other.strength;
    }
    for (let i = 0; i < this.ranks.length; i++) {
      if (this.ranks[i] !== other.ranks[i]) {
        return this.ranks[i] > other.ranks[i];
      }
    }
    return false;
  }

  equals(other: HandResult): boolean {
    return (
      this.strength === other.strength &&
      this.ranks.every((r, i) => r === other.ranks[i])
    );
  }
}
