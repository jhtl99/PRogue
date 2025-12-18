import { evaluateHand } from "../handEvaluator";
import type { Card } from "../card";

function makeCards(cardStrs: string[]): Card[] {
  return cardStrs.map(s => ({
    rank: s[0],
    suit: s[1],
  }));
}

describe("Hand Evaluator", () => {

  // ---------- STRAIGHTS ----------

  test("wheel straight (A-2-3-4-5)", () => {
    const hand = evaluateHand(
      makeCards(["AH", "2D", "3S", "4C", "5D", "9H"])
    );

    expect(hand.type).toBe("Straight");
    expect(hand.ranks).toEqual([5, 4, 3, 2, 14]);
  });

  test("broadway straight beats wheel", () => {
    const broadway = evaluateHand(
      makeCards(["TH", "JH", "QC", "KD", "AH"])
    );
    const wheel = evaluateHand(
      makeCards(["AH", "2D", "3S", "4C", "5D"])
    );

    expect(broadway.beats(wheel)).toBe(true);
  });

  // ---------- FLUSH / STRAIGHT FLUSH ----------

  test("flush detected correctly", () => {
    const hand = evaluateHand(
      makeCards(["AH", "KH", "9H", "6H", "3H", "QD"])
    );

    expect(hand.type).toBe("Flush");
    expect(hand.ranks).toEqual([14, 13, 9, 6, 3]);
  });

  test("straight flush detected correctly", () => {
    const hand = evaluateHand(
      makeCards(["9H", "TH", "JH", "QH", "KH", "2C"])
    );

    expect(hand.type).toBe("Straight Flush");
    expect(hand.ranks).toEqual([13, 12, 11, 10, 9]);
  });

  // ---------- GROUPED HANDS ----------

  test("quads", () => {
    const hand = evaluateHand(
      makeCards(["9H", "9D", "9S", "9C", "AH"])
    );

    expect(hand.type).toBe("Quads");
    expect(hand.ranks).toEqual([9, 9, 9, 9, 14]);
  });

  test("full house", () => {
    const hand = evaluateHand(
      makeCards(["AH", "AD", "AS", "KC", "KD"])
    );

    expect(hand.type).toBe("Full House");
    expect(hand.ranks).toEqual([14, 14, 14, 13, 13]);
  });

  test("trips", () => {
    const hand = evaluateHand(
      makeCards(["9H", "9D", "9S", "KC", "2D"])
    );

    expect(hand.type).toBe("Trips");
    expect(hand.ranks).toEqual([9, 9, 9, 13, 2]);
  });

  test("two pair", () => {
    const hand = evaluateHand(
      makeCards(["AH", "AD", "KC", "KD", "7S"])
    );

    expect(hand.type).toBe("Two Pair");
    expect(hand.ranks).toEqual([14, 14, 13, 13, 7]);
  });

  test("one pair", () => {
    const hand = evaluateHand(
      makeCards(["AH", "AD", "KC", "7S", "4D"])
    );

    expect(hand.type).toBe("Pair");
    expect(hand.ranks).toEqual([14, 14, 13, 7, 4]);
  });

  // ---------- TIES ----------

  test("exact tie", () => {
    const h1 = evaluateHand(
      makeCards(["AH", "AD", "KC", "7S", "4D"])
    );
    const h2 = evaluateHand(
      makeCards(["AS", "AC", "KD", "7D", "4C"])
    );

    expect(h1.equals(h2)).toBe(true);
  });

  test("kicker breaks tie", () => {
    const h1 = evaluateHand(
      makeCards(["AH", "AD", "KC", "7S", "4D"])
    );
    const h2 = evaluateHand(
      makeCards(["AH", "AD", "QC", "7D", "3S"])
    );

    expect(h1.beats(h2)).toBe(true);
  });

});
