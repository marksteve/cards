import { Game } from 'boardgame.io'
import { ascending } from 'd3-array'

const RANKS = '3456789TJQKA2'
const SUITS = 'CSHD'

class Card {
  rank: string
  suit: string

  constructor(rank: string, suit: string) {
    this.rank = rank
    this.suit = suit
  }

  value() {
    return RANKS.indexOf(this.rank) * 4 + SUITS.indexOf(this.suit)
  }

  static fromString(s: string) {
    const [rank, suit] = s
    return new Card(rank, suit)
  }

  static newDeck() {
    const d: Card[] = []
    for (const rank of RANKS) {
      for (const suit of SUITS) {
        d.push(new Card(rank, suit))
      }
    }
    return d
  }

  static lowest = Card.fromString('3C')
}

export class Play {
  cards: Card[]

  constructor(cards: Card[]) {
    this.cards = cards
    this.cards.sort((a, b) => (a.value() > b.value() ? 1 : -1))
  }

  isSameRank(cards: Card[]) {
    return cards[0].rank === cards[cards.length - 1].rank
  }

  straight() {
    const num = (card: Card) => {
      const r = RANKS.indexOf(card.rank)
      return (r + 2) % 13
    }
    const numSet = new Set(this.cards.map(num))
    if (numSet.size === 5) {
      const nums = Array.from(numSet)
      nums.sort(ascending)
      if (nums[0] + 4 === nums[4]) {
        // Use the value of the highest (by num) card.
        const card = this.cards.find((c) => num(c) === nums[4])
        return card.value()
      } else if (nums[0] === 0) {
        // Let Ace be a high card.
        nums[0] = 13
        nums.sort(ascending)
        if (nums[0] + 4 === nums[4]) {
          const card = this.cards.find((c) => num(c) === 0)
          return card.value()
        }
      }
    }
  }

  flush() {
    if (this.cards.every((c) => c.suit === this.cards[0].suit)) {
      return (
        SUITS.indexOf(this.cards[4].suit) * 13 +
        RANKS.indexOf(this.cards[4].rank)
      )
    }
  }

  quadro() {
    if (
      this.isSameRank(this.cards.slice(0, 4)) ||
      this.isSameRank(this.cards.slice(1, 5))
    ) {
      return this.cards[1].value()
    }
  }

  fullHouse() {
    if (
      this.isSameRank(this.cards.slice(0, 2)) ||
      this.isSameRank(this.cards.slice(2, 5))
    ) {
      return this.cards[2].value()
    } else if (
      this.isSameRank(this.cards.slice(0, 3)) &&
      this.isSameRank(this.cards.slice(3, 5))
    ) {
      return this.cards[2].value()
    }
  }

  value() {
    switch (this.cards.length) {
      case 1:
        return this.cards[0].value()
      case 2:
        if (this.isSameRank(this.cards)) {
          return this.cards[1].value()
        } else {
          throw new Error("Pair doesn't match")
        }
      case 3:
        if (this.isSameRank(this.cards)) {
          return this.cards[0].value()
        } else {
          throw new Error("Trio doesn't match")
        }
      case 5:
        const [combi, val] = (() => {
          let val = this.straight()
          if (val) {
            if (this.flush()) {
              return [Combi.StraightFlush, val]
            } else {
              return [Combi.Straight, val]
            }
          } else {
            if ((val = this.quadro())) {
              return [Combi.Quadro, val]
            } else if ((val = this.fullHouse())) {
              return [Combi.FullHouse, val]
            } else if ((val = this.flush())) {
              return [Combi.Flush, val]
            } else {
              return [Combi.None, 0]
            }
          }
        })()
        if (combi === Combi.None) {
          throw new Error('Invalid 5-card combination')
        } else {
          return combi * 1000 + val
        }
    }
  }

  static fromString(s: string) {
    return new Play(s.split(/\s+/).map((c) => Card.fromString(c)))
  }
}

enum Combi {
  None,
  Straight,
  Flush,
  FullHouse,
  Quadro,
  StraightFlush,
}

export const PusoyDos: Game = {
  setup: (ctx) => ({}),
}
