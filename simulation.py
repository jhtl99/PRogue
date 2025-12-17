import random
from typing import List
from hand import Card, Hand

# =========================
# CONFIGURATION
# =========================

NUM_TRIALS = 7500   # adjust for speed vs accuracy


# =========================
# SIMULATION ENGINE
# =========================

class MonteCarloSimulator:
    def __init__(self, all_cards: List[Card]):
        self.all_cards = all_cards

    def remaining_deck(self, used_cards: List[Card]) -> List[Card]:
        used = {(c.rank, c.suit) for c in used_cards}
        return [
            c for c in self.all_cards
            if (c.rank, c.suit) not in used
        ]

    def estimate_equity(
        self,
        hero_cards: List[Card],
        board_cards: List[Card] = None,
        num_opponents: int = 1,
        trials: int = NUM_TRIALS
    ):
        """
        Monte Carlo equity estimation.
        Returns win / tie / loss probabilities.
        """
        if board_cards is None:
            board_cards = []

        wins = 0
        ties = 0
        losses = 0

        for _ in range(trials):
            # ---- Build deck ----
            used_cards = hero_cards + board_cards
            deck = self.remaining_deck(used_cards)

            # ---- Shuffle once ----
            random.shuffle(deck)

            # ---- Deal opponent hands ----
            opponents = []
            idx = 0
            for _ in range(num_opponents):
                opponents.append(deck[idx:idx+2])
                idx += 2

            # ---- Complete board ----
            needed = 5 - len(board_cards)
            board_rest = deck[idx:idx+needed]
            full_board = board_cards + board_rest

            # ---- Evaluate hero ----
            hero_hand = Hand(hero_cards + full_board).get_hand()

            # ---- Evaluate opponents ----
            opp_hands = [
                Hand(opp + full_board).get_hand()
                for opp in opponents
            ]

            # ---- Determine best hand ----
            best_hand = hero_hand
            tied = False

            for opp_hand in opp_hands:
                if opp_hand > best_hand:
                    best_hand = opp_hand
                    tied = False
                elif opp_hand == best_hand:
                    tied = True

            if best_hand == hero_hand:
                if tied:
                    ties += 1
                else:
                    wins += 1
            else:
                losses += 1

        return {
            "win": wins / trials,
            "tie": ties / trials,
            "loss": losses / trials
        }


# =========================
# QUICK RUNNER
# =========================

if __name__ == "__main__":

    card_ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
    card_suits = ["H", "C", "S", "D"]

    all_cards = [Card(r, s) for r in card_ranks for s in card_suits]

    sim = MonteCarloSimulator(all_cards)

    # Example: AA preflop vs multiple opponents
    hero = [Card("A", "H"), Card("A", "C")]
    board = [Card("A", "S"), Card("K", "D"), Card("9", "C")]

    opponents = 1
    result = sim.estimate_equity(
        hero_cards=hero,
        board_cards=board,
        num_opponents=opponents
    )

    print(f"AA preflop vs {opponents} opponent(s) ({NUM_TRIALS} trials)")
    print(f"Win:  {result['win']:.4f}")
    print(f"Tie:  {result['tie']:.4f}")
    print(f"Loss: {result['loss']:.4f}")
