export const HAND_RANKINGS = [
  "Straight Flush",
  "Quads",
  "Full House",
  "Flush",
  "Straight",
  "Trips",
  "Two Pair",
  "Pair",
  "High Card",
] as const;

export type HandType = typeof HAND_RANKINGS[number];

export const RANK_VALUE: Record<string, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "T": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
  "A": 14,
};
