import unittest
from hand import Card, Hand


def make_cards(card_strs):
    return [Card(rank=s[0], suit=s[1:]) for s in card_strs]


class TestHandComparison(unittest.TestCase):

    # ---------- DIFFERENT HAND TYPES ----------

    def test_straight_flush_beats_quads(self):
        sf = Hand(make_cards(["9H", "TH", "JH", "QH", "KH"])).get_hand()
        quads = Hand(make_cards(["9H", "9D", "9S", "9C", "AH"])).get_hand()

        self.assertTrue(sf > quads)

    def test_full_house_beats_flush(self):
        fh = Hand(make_cards(["AH", "AD", "AS", "KC", "KD"])).get_hand()
        flush = Hand(make_cards(["AH", "KH", "9H", "6H", "3H"])).get_hand()

        self.assertTrue(fh > flush)

    def test_trips_beats_two_pair(self):
        trips = Hand(make_cards(["9H", "9D", "9S", "KC", "2D"])).get_hand()
        two_pair = Hand(make_cards(["AH", "AD", "KC", "KD", "2S"])).get_hand()

        self.assertTrue(trips > two_pair)

    # ---------- SAME HAND TYPE, DIFFERENT STRENGTH ----------

    def test_higher_pair_wins(self):
        pair_aces = Hand(make_cards(["AH", "AD", "KC", "7S", "4D"])).get_hand()
        pair_kings = Hand(make_cards(["KH", "KD", "QC", "7D", "3S"])).get_hand()

        self.assertTrue(pair_aces > pair_kings)

    def test_kicker_breaks_tie(self):
        h1 = Hand(make_cards(["AH", "AD", "KC", "7S", "4D"])).get_hand()
        h2 = Hand(make_cards(["AH", "AD", "QC", "7D", "3S"])).get_hand()

        self.assertTrue(h1 > h2)

    # ---------- STRAIGHT COMPARISON ----------

    def test_broadway_beats_wheel(self):
        broadway = Hand(make_cards(["TH", "JH", "QC", "KD", "AH"])).get_hand()
        wheel = Hand(make_cards(["AH", "2D", "3S", "4C", "5D"])).get_hand()

        self.assertTrue(broadway > wheel)

    # ---------- TIES ----------

    def test_exact_pair_tie(self):
        h1 = Hand(make_cards(["AH", "AD", "KC", "7S", "4D"])).get_hand()
        h2 = Hand(make_cards(["AS", "AC", "KD", "7D", "4C"])).get_hand()

        self.assertEqual(h1, h2)

    def test_high_card_tie(self):
        h1 = Hand(make_cards(["AH", "KD", "7S", "4C", "2D"])).get_hand()
        h2 = Hand(make_cards(["AS", "KC", "7D", "4D", "2C"])).get_hand()

        self.assertEqual(h1, h2)

    def test_straight_tie(self):
        h1 = Hand(make_cards(["9H", "TH", "JS", "QC", "KD"])).get_hand()
        h2 = Hand(make_cards(["9D", "TC", "JD", "QS", "KS"])).get_hand()

        self.assertEqual(h1, h2)

    def test_wheel_tie(self):
        h1 = Hand(make_cards(["AH", "2D", "3S", "4C", "5D"])).get_hand()
        h2 = Hand(make_cards(["AS", "2C", "3D", "4D", "5H"])).get_hand()

        self.assertEqual(h1, h2)

    def test_flush_tie(self):
        h1 = Hand(make_cards(["AH", "KH", "9H", "6H", "3H"])).get_hand()
        h2 = Hand(make_cards(["AS", "KS", "9S", "6S", "3S"])).get_hand()

        self.assertEqual(h1, h2)

    def test_full_house_tie(self):
        h1 = Hand(make_cards(["AH", "AD", "AS", "KC", "KD"])).get_hand()
        h2 = Hand(make_cards(["AS", "AC", "AH", "KD", "KC"])).get_hand()

        self.assertEqual(h1, h2)

    # ---------- MULTI-HAND COMPARISON ----------

    def test_multiple_hands(self):
        hands = [
            Hand(make_cards(["AH", "KD", "7S", "4C", "2D"])).get_hand(),   # High Card
            Hand(make_cards(["9H", "9D", "KC", "7S", "4D"])).get_hand(),   # Pair
            Hand(make_cards(["9H", "9D", "9S", "KC", "2D"])).get_hand(),   # Trips
            Hand(make_cards(["AH", "AD", "AS", "KC", "KD"])).get_hand(),   # Full House
            Hand(make_cards(["9H", "TH", "JH", "QH", "KH"])).get_hand()    # Straight Flush
        ]

        winner = max(hands)
        self.assertEqual(winner.type, "Straight Flush")


if __name__ == "__main__":
    unittest.main()
