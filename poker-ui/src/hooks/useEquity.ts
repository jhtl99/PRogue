import { useEffect, useState } from "react";
import type { Card } from "../engine/card";
import { estimateEquity } from "../engine/simulator";

type EquityResult = {
  win: number;
  tie: number;
  loss: number;
};

export function useEquity(
  heroCards: Card[],
  boardCards: Card[],
  numOpponents: number
) {
  const [equity, setEquity] = useState<EquityResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsComputing(true);

    // Run simulation async so UI doesn't freeze
    setTimeout(() => {
      const result = estimateEquity(heroCards, boardCards, numOpponents);

      if (!cancelled) {
        setEquity(result);
        setIsComputing(false);
      }
    }, 0);

    return () => {
      cancelled = true;
    };
  }, [heroCards, boardCards, numOpponents]);

  return { equity, isComputing };
}
