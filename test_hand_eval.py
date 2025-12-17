import unittest
from hand import Card, Hand, HandResult

def make_cards(card_strs):
    return [Card(rank=s[0], suit=s[1:]) for s in card_strs]


class TestHandEvaluation(unittest.TestCase):

    # ---------- HIGH CARD ----------

    def test_high_card(self):
        hand = Hand(make_cards([
            "AH", "KD", "7S", "4C", "2D"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "High Card")
        self.assertEqual(result.ranks, [14, 13, 7, 4, 2])

    # ---------- PAIR ----------

    def test_pair(self):
        hand = Hand(make_cards([
            "AH", "AD", "KC", "7S", "4D", "2C"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Pair")
        self.assertEqual(result.ranks[:2], [14, 14])  # pair of aces

    # ---------- TWO PAIR ----------

    def test_two_pair(self):
        hand = Hand(make_cards([
            "AH", "AD", "KC", "KD", "7S", "2C"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Two Pair")
        self.assertEqual(result.ranks[:4], [14, 14, 13, 13])

    # ---------- TRIPS ----------

    def test_trips(self):
        hand = Hand(make_cards([
            "9H", "9D", "9S", "KC", "7D", "2C"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Trips")
        self.assertEqual(result.ranks[:3], [9, 9, 9])

    # ---------- STRAIGHT ----------

    def test_straight(self):
        hand = Hand(make_cards([
            "9H", "TD", "JS", "QC", "KD", "2C"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Straight")
        self.assertEqual(result.ranks, [13, 12, 11, 10, 9])

    def test_wheel_straight(self):
        hand = Hand(make_cards([
            "AH", "2D", "3S", "4C", "5D", "9H"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Straight")
        self.assertEqual(result.ranks, [5, 4, 3, 2, 14])  # A low

    # ---------- FLUSH ----------

    def test_flush(self):
        hand = Hand(make_cards([
            "AH", "KH", "9H", "6H", "3H", "QD"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Flush")
        self.assertEqual(result.ranks, [14, 13, 9, 6, 3])

    # ---------- FULL HOUSE ----------

    def test_full_house(self):
        hand = Hand(make_cards([
            "AH", "AD", "AS", "KC", "KD", "2C"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Full House")
        self.assertEqual(result.ranks[:3], [14, 14, 14])
        self.assertEqual(result.ranks[3:], [13, 13])

    # ---------- QUADS ----------

    def test_quads(self):
        hand = Hand(make_cards([
            "9H", "9D", "9S", "9C", "AH", "2D"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Quads")
        self.assertEqual(result.ranks[:4], [9, 9, 9, 9])
        self.assertEqual(result.ranks[4], 14)

    # ---------- STRAIGHT FLUSH ----------

    def test_straight_flush(self):
        hand = Hand(make_cards([
            "9H", "TH", "JH", "QH", "KH", "2C"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Straight Flush")
        self.assertEqual(result.ranks, [13, 12, 11, 10, 9])

    # ---------- PRIORITY CHECKS ----------

    def test_straight_flush_beats_flush(self):
        hand = Hand(make_cards([
            "9H", "TH", "JH", "QH", "KH", "AH"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Straight Flush")

    def test_full_house_beats_trips(self):
        hand = Hand(make_cards([
            "9H", "9D", "9S", "2C", "2D", "AH"
        ]))

        result = hand.get_hand()
        self.assertEqual(result.type, "Full House")


if __name__ == "__main__":
    unittest.main()
