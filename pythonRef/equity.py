import itertools
from time import time
from hand import Card, Hand, HandResult

class Game:
    def __init__(self, all_cards):
        self.all_cards = all_cards

    def remaining_deck(self, used_cards):
        used = {(c.rank, c.suit) for c in used_cards}
        return [
            c for c in self.all_cards
            if (c.rank, c.suit) not in used
        ]

    def exact_equity_vs_one(self, hero_cards, board_cards=None):
        if board_cards is None:
            board_cards = []

        used_cards = hero_cards + board_cards
        deck = self.remaining_deck(used_cards)

        wins = 0
        losses = 0
        ties = 0

        start = time()

        # Opponent hole cards
        for opp_cards in itertools.combinations(deck, 2):
            deck_after_opp = [
                c for c in deck if c not in opp_cards
            ]

            # Complete the board to 5 cards
            for board_rest in itertools.combinations(
                deck_after_opp, 5 - len(board_cards)
            ):
                full_board = board_cards + list(board_rest)

                hero_hand = Hand(hero_cards + full_board).get_hand()
                opp_hand = Hand(list(opp_cards) + full_board).get_hand()

                if hero_hand > opp_hand:
                    wins += 1
                elif hero_hand < opp_hand:
                    losses += 1
                else:
                    ties += 1

        total = wins + losses + ties
        elapsed = time() - start

        return {
            "equity": wins / total,
            "wins": wins,
            "losses": losses,
            "ties": ties,
            "total": total,
            "seconds": elapsed
        }

card_ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
card_suits = ["H", "C", "S", "D"]

all_cards = [Card(r, s) for r in card_ranks for s in card_suits]


game = Game(all_cards)

hero = [
    Card("A", "H"),
    Card("A", "C")
]

result = game.exact_equity_vs_one(hero)

print("AA vs 1 opponent (exact):")
print(f"Equity:  {result['equity']:.4f}")
print(f"Wins:    {result['wins']}")
print(f"Losses:  {result['losses']}")
print(f"Ties:    {result['ties']}")
print(f"Total:   {result['total']}")
print(f"Time:    {result['seconds']:.2f} seconds")
