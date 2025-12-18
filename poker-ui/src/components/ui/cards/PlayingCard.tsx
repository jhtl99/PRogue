import type { Card } from "../../../engine/card";
import { useEffect, useRef, useState } from "react";

type Props = {
  card: Card | null;
  faceDown?: boolean;
  dealId?: number; // bumps to force reveal animation (useful for hero redeals)
};

const SUIT_SYMBOL: Record<string, string> = {
  H: "♥",
  D: "♦",
  C: "♣",
  S: "♠",
};

function isRedSuit(suit: string) {
  return suit === "H" || suit === "D";
}

export function PlayingCard({ card, faceDown, dealId }: Props) {
  const [reveal, setReveal] = useState(false);
  const prevCardIdRef = useRef<string | null>(null);
  const prevDealIdRef = useRef<number | undefined>(dealId);

  useEffect(() => {
    const cardId = card ? `${card.rank}${card.suit}` : null;

    const cardChanged = cardId !== prevCardIdRef.current;
    const dealBumped = dealId !== prevDealIdRef.current;
    const shouldAnimate = !!cardId && !faceDown && (cardChanged || dealBumped);

    if (shouldAnimate) {
      setReveal(true);
      const t = setTimeout(() => setReveal(false), 230);
      return () => clearTimeout(t);
    }

    prevCardIdRef.current = cardId;
    prevDealIdRef.current = dealId;
  }, [card?.rank, card?.suit, faceDown, dealId]);

  if (!card) {
    return (
      <div className="h-24 w-16 rounded-md border border-dashed border-slate-600 bg-slate-900/40" />
    );
  }

  if (faceDown) {
    return (
      <div className="h-24 w-16 rounded-md border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 grid place-items-center">
        <div className="h-10 w-8 rounded border border-slate-500/40" />
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOL[card.suit] ?? card.suit;
  const red = isRedSuit(card.suit);

  return (
    <div
      className={`h-24 w-16 rounded-md border border-slate-300 bg-white px-2 py-1 flex flex-col justify-between ${
        reveal ? "card-reveal" : ""
      }`}
    >
      <div className={`text-sm font-semibold ${red ? "text-red-600" : "text-black"}`}>
        {card.rank}
      </div>
      <div className={`text-2xl leading-none text-center ${red ? "text-red-600" : "text-black"}`}>
        {suitSymbol}
      </div>
      <div className={`text-sm font-semibold text-right ${red ? "text-red-600" : "text-black"}`}>
        {card.rank}
      </div>
    </div>
  );
}
