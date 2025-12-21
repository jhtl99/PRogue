import type { Card } from "../../../engine/card";
import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  card: Card | null;
  faceDown?: boolean; // used for opponent hidden cards (no flip)
  dealId?: number;    // bump on redeal (hero reset)
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

function CardBack() {
  return (
    <div className="h-32 w-22 rounded-xl game-card-back grid place-items-center relative overflow-hidden">
      <div className="absolute inset-2 rounded-lg border border-blue-300/30" />
      <div className="h-8 w-8 rounded-full bg-blue-300/20" />
    </div>
  );
}

function CardFront({ card }: { card: Card }) {
  const suitSymbol = SUIT_SYMBOL[card.suit] ?? card.suit;
  const red = isRedSuit(card.suit);

  return (
    <div className="h-32 w-22 rounded-xl game-card px-2 py-1 flex flex-col justify-between">
      <div className={`text-sm font-semibold ${red ? "text-red-600" : "text-slate-900"}`}>
        {card.rank}
      </div>
      <div className={`text-2xl leading-none text-center ${red ? "text-red-600" : "text-slate-900"}`}>
        {suitSymbol}
      </div>
      <div className={`text-sm font-semibold text-right ${red ? "text-red-600" : "text-slate-900"}`}>
        {card.rank}
      </div>
    </div>
  );
}

export function PlayingCard({ card, faceDown, dealId }: Props) {
  // If there is no card, show an empty slot (no flip)
  if (!card) {
    return (
      <div className="h-32 w-22 rounded-xl card-slot" />
    );
  }

  // If explicitly faceDown (e.g. hidden opponent card), show back only (no flip)
  if (faceDown) {
    return <CardBack />;
  }

  const [flipped, setFlipped] = useState(false);

  const prevCardIdRef = useRef<string | null>(null);
  const prevDealIdRef = useRef<number | undefined>(dealId);
  const flipTokenRef = useRef(0);

  useLayoutEffect(() => {
    if (!card || faceDown) return;

    const cardId = `${card.rank}${card.suit}`;
    const cardChanged = cardId !== prevCardIdRef.current;
    const dealBumped = dealId !== prevDealIdRef.current;

    if (cardChanged || dealBumped) {
      // new "deal" happened
      flipTokenRef.current += 1;
      const token = flipTokenRef.current;

      // show back immediately
      setFlipped(false);

      // then flip on next frame
      requestAnimationFrame(() => {
        if (flipTokenRef.current === token) {
          setFlipped(true);
        }
      });

      prevCardIdRef.current = cardId;
      prevDealIdRef.current = dealId;
    } else {
      // keep refs in sync
      prevCardIdRef.current = cardId;
      prevDealIdRef.current = dealId;
    }
  }, [card?.rank, card?.suit, dealId, faceDown]);


  return (
    <div className="card-flip h-32 w-22">
      <div className={`card-inner ${flipped ? "is-flipped" : ""}`}>
        <div className="card-face card-back">
          <CardBack />
        </div>
        <div className="card-face card-front">
          <CardFront card={card} />
        </div>
      </div>
    </div>
  );
}
