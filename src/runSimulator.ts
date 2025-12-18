import { estimateEquity } from "../poker-ui/src/engine/simulator";
import { Card } from "../poker-ui/src/engine/card";

const hero: Card[] = [
  { rank: "A", suit: "H" },
  { rank: "A", suit: "C" }
];

const board: Card[] = [
  { rank: "A", suit: "S" },
  { rank: "K", suit: "D" },
  { rank: "9", suit: "C" }
];

const opponents = 1;

const result = estimateEquity(hero, board, opponents);

console.log(`Equity vs ${opponents} opponent(s):`);
console.log(`Win:  ${(result.win * 100).toFixed(2)}%`);
console.log(`Tie:  ${(result.tie * 100).toFixed(2)}%`);
console.log(`Loss: ${(result.loss * 100).toFixed(2)}%`);
