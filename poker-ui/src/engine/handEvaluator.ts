// engine/handEvaluator.ts

import {cardValue } from "./card";
import type { Card } from "./card";
import { HandResult } from "./handResult";
import type { HandType } from "./constants";

function sortDesc(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => cardValue(b) - cardValue(a));
}

function rankGroups(cards: Card[]): Map<number, Card[]> {
  const map = new Map<number, Card[]>();
  for (const c of cards) {
    const v = cardValue(c);
    if (!map.has(v)) map.set(v, []);
    map.get(v)!.push(c);
  }
  return map;
}


function getFlush(cards: Card[]): Card[] | null {
  const suitCounts = new Map<string, Card[]>();

  for (const c of cards) {
    if (!suitCounts.has(c.suit)) suitCounts.set(c.suit, []);
    suitCounts.get(c.suit)!.push(c);
  }

  for (const suited of suitCounts.values()) {
    if (suited.length >= 5) {
      return sortDesc(suited).slice(0, 5);
    }
  }
  return null;
}

function getStraight(cards: Card[]): Card[] | null {
  if (cards.length < 5) return null;

  const valueMap = new Map<number, Card[]>();
  for (const c of cards) {
    const v = cardValue(c);
    if (!valueMap.has(v)) valueMap.set(v, []);
    valueMap.get(v)!.push(c);
  }

  const values = new Set(valueMap.keys());
  if (values.has(14)) {
    values.add(1);
    valueMap.set(1, valueMap.get(14)!);
  }

  const sorted = Array.from(values).sort((a, b) => a - b);

  let run: number[] = [];
  let bestHigh: number | null = null;

  for (const v of sorted) {
    if (run.length === 0 || v === run[run.length - 1] + 1) {
      run.push(v);
    } else {
      run = [v];
    }
    if (run.length >= 5) bestHigh = v;
  }

  if (bestHigh === null) return null;

  const needed = Array.from(
    { length: 5 },
    (_, i) => bestHigh! - 4 + i
  );

  let result = needed.map(v => valueMap.get(v)![0]);
  result = sortDesc(result);

  // Wheel fix
  if (bestHigh === 5) {
    result = [
      ...result.filter(c => c.rank !== "A"),
      ...result.filter(c => c.rank === "A"),
    ];
  }

  return result;
}

function getStraightFlush(cards: Card[]): Card[] | null {
  const flush = getFlush(cards);
  if (!flush) return null;

  const suit = flush[0].suit;
  const suited = cards.filter(c => c.suit === suit);

  return getStraight(suited);
}

function getQuads(cards: Card[]): Card[] | null {
  const groups = rankGroups(cards);

  let quadRank: number | null = null;
  for (const [rank, group] of groups.entries()) {
    if (group.length === 4) {
      quadRank = rank;
      break;
    }
  }

  if (quadRank === null) return null;

  const quads = groups.get(quadRank)!;
  const kickers = cards.filter(c => cardValue(c) !== quadRank);
  const kicker = sortDesc(kickers)[0];

  return [...quads, kicker];
}

function getFullHouse(cards: Card[]): Card[] | null {
  const groups = rankGroups(cards);

  const trips = Array.from(groups.entries())
    .filter(([_, g]) => g.length >= 3)
    .map(([r]) => r)
    .sort((a, b) => b - a);

  if (trips.length === 0) return null;

  const tripRank = trips[0];
  const tripCards = groups.get(tripRank)!.slice(0, 3);

  const pairs = Array.from(groups.entries())
    .filter(([r, g]) => r !== tripRank && g.length >= 2)
    .map(([r]) => r)
    .sort((a, b) => b - a);

  if (pairs.length === 0) return null;

  const pairRank = pairs[0];
  const pairCards = groups.get(pairRank)!.slice(0, 2);

  return [...tripCards, ...pairCards];
}

function getTrips(cards: Card[]): Card[] | null {
  const groups = rankGroups(cards);

  const trips = Array.from(groups.entries())
    .filter(([_, g]) => g.length >= 3)
    .map(([r]) => r)
    .sort((a, b) => b - a);

  if (trips.length === 0) return null;

  const tripRank = trips[0];
  const tripCards = groups.get(tripRank)!.slice(0, 3);

  const kickers = sortDesc(
    cards.filter(c => cardValue(c) !== tripRank)
  ).slice(0, 2);

  return [...tripCards, ...kickers];
}

function getTwoPair(cards: Card[]): Card[] | null {
  const groups = rankGroups(cards);

  const pairs = Array.from(groups.entries())
    .filter(([_, g]) => g.length >= 2)
    .map(([r]) => r)
    .sort((a, b) => b - a);

  if (pairs.length < 2) return null;

  const [highPair, lowPair] = pairs.slice(0, 2);

  const pairCards = [
    ...groups.get(highPair)!.slice(0, 2),
    ...groups.get(lowPair)!.slice(0, 2),
  ];

  const kicker = sortDesc(
    cards.filter(c =>
      cardValue(c) !== highPair && cardValue(c) !== lowPair
    )
  )[0];

  return [...pairCards, kicker];
}

function getPair(cards: Card[]): Card[] | null {
  const groups = rankGroups(cards);

  const pairs = Array.from(groups.entries())
    .filter(([_, g]) => g.length >= 2)
    .map(([r]) => r)
    .sort((a, b) => b - a);

  if (pairs.length === 0) return null;

  const pairRank = pairs[0];
  const pairCards = groups.get(pairRank)!.slice(0, 2);

  const kickers = sortDesc(
    cards.filter(c => cardValue(c) !== pairRank)
  ).slice(0, 3);

  return [...pairCards, ...kickers];
}


export function evaluateHand(cards: Card[]): HandResult {
  const checks: [HandType, (c: Card[]) => Card[] | null][] = [
    ["Straight Flush", getStraightFlush],
    ["Quads", getQuads],
    ["Full House", getFullHouse],
    ["Flush", getFlush],
    ["Straight", getStraight],
    ["Trips", getTrips],
    ["Two Pair", getTwoPair],
    ["Pair", getPair],
  ];

  for (const [type, fn] of checks) {
    const res = fn(cards);
    if (res) return new HandResult(type, res);
  }

  // High card
  return new HandResult("High Card", sortDesc(cards).slice(0, 5));
}

