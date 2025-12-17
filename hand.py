# given your hand and the current state of the board, and the number of players
# return the probability that you will win.
from collections import defaultdict

hand_rankings = ["Straight Flush", "Quads", "Full House", 
            "Flush", "Straight", "Trips", "Two Pair", "Pair", "High Card"]

RANK_VALUE = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
    "8": 8, "9": 9, "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14
}

# STRAIGHT_COMBOS = [['A','2','3','4','5'], ['2','3','4','5','6'], 
#                            ['3','4','5','6','7'], ['4','5','6','7','8'],
#                            ['5','6','7','8','9'], ['6','7','8','9','T'],
#                            ['7','8','9','T','J'], ['8','9','T','J','Q'],
#                            ['9','T','J','Q','K'], ['T','J','Q','K','A']]



class Card:

    @property
    def value(self):
        return RANK_VALUE[self.rank]
    # Cards will have a rank and a suit
    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit
    
    def __repr__(self):
        return f"{self.rank} of {self.suit}"
    
class HandResult:

    def __init__(self, hand_type, cards):
        self.type = hand_type
        self.cards = cards
        self.ranks = [c.value for c in cards]
        self.strength = hand_rankings.index(hand_type)
    
    def __repr__(self):
        return f"{self.type} using cards {self.cards}"

# each player will have a hand object to determine their standing
class Hand:

    def __init__(self, cards=None):
        self.cards = cards

    def add_card(self, card):
        if not self.cards:
            self.cards = []
        self.cards.append(card)

    # ------ HELPERS -------
    
    def sort_cards_desc(self, cards):
        return sorted(cards, key=lambda c: c.value, reverse=True)

    
    def get_rank_groups(self, cards=None):
        if cards is None:
            cards = self.cards

        rank_groups = defaultdict(list)
        for c in cards:
            rank_groups[c.value].append(c)

        return rank_groups

    # ------ Get Hand Values --------
    
    def get_flush_suit(self, cards = None):
        if cards is None:
            cards = self.cards

        if len(cards) < 5:
            return None
        
        counts = defaultdict(int)
        for c in cards:
            counts[c.suit] += 1
        
        for suit, count in counts.items():
            if count >= 5:
                return suit
        
        return None

    # for checking a hand status, return the cards that create the combo
    def get_flush(self, cards = None):
        if cards is None:
            cards = self.cards
        suit = self.get_flush_suit(cards)

        if not suit:
            return None

        suited_cards = [c for c in cards if c.suit == suit]
        suited_cards = self.sort_cards_desc(suited_cards)

        return suited_cards[:5]

    def get_straight(self, cards = None):
        if cards is None:
            cards = self.cards
        
        if len(cards) < 5:
            return None

        # Map value to cards (to reconstruct later)
        value_to_cards = {}
        for c in cards:
            value_to_cards.setdefault(c.value, []).append(c)

        values = set(value_to_cards.keys())

        # Ace can also act as low (value 1)
        if 14 in values:
            values.add(1)
            value_to_cards[1] = value_to_cards[14]

        sorted_values = sorted(values)

        best_high = None
        run = []

        for v in sorted_values:
            if not run or v == run[-1] + 1:
                run.append(v)
            else:
                run = [v]

            if len(run) >= 5:
                best_high = run[-1]

        if best_high is None:
            return None

        # Reconstruct the straight (highest possible)
        straight_values = list(range(best_high - 4, best_high + 1))

        result = []
        for v in straight_values:
            result.append(value_to_cards[v][0])  # take any card of that rank

        # Sort high to low for consistency to compare hands later
        result.sort(key=lambda c: c.value, reverse=True)
        if best_high == 5:
        # move Ace to the end
            result = [c for c in result if c.rank != "A"] + [c for c in result if c.rank == "A"]
        return result


    
    def get_straight_flush(self, cards = None):
        if cards is None:
            cards = self.cards

        if len(cards) < 5:
            return None

        flush_suit = self.get_flush_suit(cards)

        flushed_cards = [c for c in cards if c.suit == flush_suit]
        return self.get_straight(flushed_cards)
    
    def get_quads(self, cards=None):
        if cards is None:
            cards = self.cards

        rank_groups = self.get_rank_groups(cards)

        quad_rank = None
        for rank, group in rank_groups.items():
            if len(group) == 4:
                quad_rank = rank
                break

        if quad_rank is None:
            return None

        quads = rank_groups[quad_rank]

        kickers = [c for c in cards if c.value != quad_rank]
        kicker = max(kickers, key=lambda c: c.value)

        return quads + [kicker]
    
    def get_full_house(self, cards=None):
        if cards is None:
            cards = self.cards

        rank_groups = self.get_rank_groups(cards)

        trips = sorted(
            [r for r, g in rank_groups.items() if len(g) >= 3],
            reverse=True
        )

        if not trips:
            return None

        trip_rank = trips[0]
        trip_cards = rank_groups[trip_rank][:3]

        remaining_pairs = sorted(
            [r for r, g in rank_groups.items() if r != trip_rank and len(g) >= 2],
            reverse=True
        )

        if not remaining_pairs:
            return None

        pair_rank = remaining_pairs[0]
        pair_cards = rank_groups[pair_rank][:2]

        return trip_cards + pair_cards
    
    def get_trips(self, cards=None):
        if cards is None:
            cards = self.cards

        rank_groups = self.get_rank_groups(cards)

        trips = sorted(
            [r for r, g in rank_groups.items() if len(g) >= 3],
            reverse=True
        )

        if not trips:
            return None

        trip_rank = trips[0]
        trip_cards = rank_groups[trip_rank][:3]

        kickers = [c for c in cards if c.value != trip_rank]
        kickers = sorted(kickers, key=lambda c: c.value, reverse=True)[:2]

        return trip_cards + kickers
    
    def get_two_pair(self, cards=None):
        if cards is None:
            cards = self.cards

        rank_groups = self.get_rank_groups(cards)

        pairs = sorted(
            [r for r, g in rank_groups.items() if len(g) >= 2],
            reverse=True
        )

        if len(pairs) < 2:
            return None

        high_pair, low_pair = pairs[:2]

        pair_cards = (
            rank_groups[high_pair][:2] +
            rank_groups[low_pair][:2]
        )

        kickers = [
            c for c in cards
            if c.value not in (high_pair, low_pair)
        ]
        kicker = max(kickers, key=lambda c: c.value)

        return pair_cards + [kicker]
    
    def get_pair(self, cards=None):
        if cards is None:
            cards = self.cards

        rank_groups = self.get_rank_groups(cards)

        pairs = sorted(
            [r for r, g in rank_groups.items() if len(g) >= 2],
            reverse=True
        )

        if not pairs:
            return None

        pair_rank = pairs[0]
        pair_cards = rank_groups[pair_rank][:2]

        kickers = [
            c for c in cards
            if c.value != pair_rank
        ]
        kickers = sorted(kickers, key=lambda c: c.value, reverse=True)[:3]

        return pair_cards + kickers





    # based on a hand, get the metadata of the best combo of the hand
    def get_hand(self):
        
        checks = [
            ("Straight Flush", self.get_straight_flush),
            ("Quads", self.get_quads),
            ("Full House", self.get_full_house),
            ("Flush", self.get_flush),
            ("Straight", self.get_straight),
            ("Trips", self.get_trips),
            ("Two Pair", self.get_two_pair),
            ("Pair", self.get_pair),
        ]

        for hand_type, func in checks:
            cards = func()
            if cards:
                return HandResult(hand_type, cards)
        
        # fall back to high card
        sorted_cards = sorted(self.cards, key=lambda c: c.value, reverse=True)
        return HandResult("High Card", sorted_cards[:5])


if __name__ == "__main__":

    card_ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"]
    card_suits = ["H", "C", "S", "D"]

    cards = []
    hand = Hand()

    for r in card_ranks:
        for s in card_suits:
            c = Card(r, s)
            cards.append(c)
            # print(c)
            # hand.add_card(c)
    
    def make_cards(card_strs):
        return [Card(rank=s[0], suit=s[1:]) for s in card_strs]
    
    hand = Hand(make_cards([
        "AH", "2D", "3S", "4C", "5D", "9H"
    ]))

    print(hand.get_hand())

    print("Testing Flush")
    hand = Hand(make_cards([
        "AH", "KH", "9H", "6H", "3H", "QD"
    ]))

    print(hand.get_hand())


    print("Testing SF")
    hand = Hand(make_cards([
        "9H", "TH", "JH", "QH", "KH", "2C"
    ]))

    print(hand.get_hand())




    



    # print(hand.get_hand())




