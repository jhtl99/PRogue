import unittest
from hand import Card, Hand


def make_cards(card_strs):
    return [Card(rank=s[0], suit=s[1:]) for s in card_strs]


def compare(h1, h2):
    """
    Returns:
        -1 if h1 < h2
         0 if tie
         1 if h1 > h2
    """
    r1 = h1.get_hand()
    r2 = h2.get_hand()

    # Lower strength index is better
    if r1.strength != r2.strength:
        return -1 if r1.strength < r2.strength else 1

    # Lexicographic comparison of ranks
    if r1.ranks != r2.ranks:
        return -1 if r1.ranks > r2.ranks else 1

    return 0


def best_hand(*hands):
    results = [h.get_hand() for h in hands]

    def key_fn(hr):
        return (hr.strength, [-r for r in hr.ranks])

    return min(results, key=key_fn)


class TestHandComparison(unittest.TestCase):

    # ---------- DIFFERENT HAND TYPES ----------

    def test_straight_flush_beats_quads(self):
        sf = Hand(make_cards(["9H", "TH", "JH", "QH", "KH"]))
        quads = Hand(make_cards(["9H", "9D", "9S", "9C", "AH"]))

        winner = best_hand(sf, quads)
        self.assertEqual(winner.type, "Straight Flush")

    def test_full_house_beats_flush(self):
        fh = Hand(make_cards(["AH", "AD", "AS", "KC", "KD"]))
        flush = Hand(make_cards(["AH", "KH", "9H", "6H", "3H"]))

        winner = best_hand(fh, flush)
        self.assertEqual(winner.type, "Full House")

    def test_trips_beats_two_pair(self):
        trips = Hand(make_cards(["9H", "9D", "9S", "KC", "2D"]))
        two_pair = Hand(make_cards(["AH", "AD", "KC", "KD", "2S"]))

        winner = best_hand(trips, two_pair)
        self.assertEqual(winner.type, "Trips")

    # ---------- SAME HAND TYPE, DIFFERENT STRENGTH ----------

    def test_higher_pair_wins(self):
        pair_aces = Hand(make_cards(["AH", "AD", "KC", "7S", "4D"]))
        pair_kings = Hand(make_cards(["KH", "KD", "QC", "7D", "3S"]))

        winner = best_hand(pair_aces, pair_kings)
        self.assertEqual(winner.type, "Pair")
        self.assertEqual(winner.ranks[0], 14)

    def test_kicker_breaks_tie(self):
        h1 = Hand(make_cards(["AH", "AD", "KC", "7S", "4D"]))
        h2 = Hand(make_cards(["AH", "AD", "QC", "7D", "3S"]))

        self.assertEqual(compare(h1, h2), -1)

    # ---------- STRAIGHT COMPARISON ----------

    def test_broadway_beats_wheel(self):
        broadway = Hand(make_cards(["TH", "JH", "QC", "KD", "AH"]))
        wheel = Hand(make_cards(["AH", "2D", "3S", "4C", "5D"]))

        winner = best_hand(broadway, wheel)
        self.assertEqual(winner.type, "Straight")
        self.assertEqual(winner.ranks[0], 14)

    # ---------- TIES ----------

    def test_exact_pair_tie(self):
        h1 = Hand(make_cards(["AH", "AD", "KC", "7S", "4D"]))
        h2 = Hand(make_cards(["AS", "AC", "KD", "7D", "4C"]))

        self.assertEqual(compare(h1, h2), 0)

    def test_high_card_tie(self):
        h1 = Hand(make_cards(["AH", "KD", "7S", "4C", "2D"]))
        h2 = Hand(make_cards(["AS", "KC", "7D", "4D", "2C"]))

        self.assertEqual(compare(h1, h2), 0)

    def test_straight_tie(self):
        h1 = Hand(make_cards(["9H", "TH", "JS", "QC", "KD"]))
        h2 = Hand(make_cards(["9D", "TC", "JD", "QS", "KS"]))

        self.assertEqual(compare(h1, h2), 0)

    def test_wheel_tie(self):
        h1 = Hand(make_cards(["AH", "2D", "3S", "4C", "5D"]))
        h2 = Hand(make_cards(["AS", "2C", "3D", "4D", "5H"]))

        self.assertEqual(compare(h1, h2), 0)

    def test_flush_tie(self):
        h1 = Hand(make_cards(["AH", "KH", "9H", "6H", "3H"]))
        h2 = Hand(make_cards(["AS", "KS", "9S", "6S", "3S"]))

        self.assertEqual(compare(h1, h2), 0)

    def test_full_house_tie(self):
        h1 = Hand(make_cards(["AH", "AD", "AS", "KC", "KD"]))
        h2 = Hand(make_cards(["AS", "AC", "AH", "KD", "KC"]))

        self.assertEqual(compare(h1, h2), 0)

    # ---------- MULTI-HAND COMPARISON ----------

    def test_multiple_hands(self):
        hands = [
            Hand(make_cards(["AH", "KD", "7S", "4C", "2D"])),  # High Card
            Hand(make_cards(["9H", "9D", "KC", "7S", "4D"])),  # Pair
            Hand(make_cards(["9H", "9D", "9S", "KC", "2D"])),  # Trips
            Hand(make_cards(["AH", "AD", "AS", "KC", "KD"])),  # Full House
            Hand(make_cards(["9H", "TH", "JH", "QH", "KH"]))   # Straight Flush
        ]

        winner = best_hand(*hands)
        self.assertEqual(winner.type, "Straight Flush")


if __name__ == "__main__":
    unittest.main()
