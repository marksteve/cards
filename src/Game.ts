import { Ctx, Game } from 'boardgame.io'
import { INVALID_MOVE } from 'boardgame.io/core'
import { ascending } from 'd3-array'

const RANKS = '3456789TJQKA2'
const SUITS = 'CSHD'

enum Combi {
  None,
  Straight,
  Flush,
  FullHouse,
  Quadro,
  StraightFlush,
}

export class Card {
  rank: string
  suit: string

  constructor(rank: string, suit: string) {
    this.rank = rank
    this.suit = suit
  }

  get value() {
    return RANKS.indexOf(this.rank) * 4 + SUITS.indexOf(this.suit)
  }

  get [Symbol.toStringTag]() {
    return this.toString()
  }

  toString() {
    return `${this.rank}${this.suit}`
  }

  static fromString(s: string) {
    const [rank, suit] = s.split('')
    return new Card(rank, suit)
  }

  static fromState(card: any) {
    return new Card(card.rank, card.suit)
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
  player?: number

  constructor(cards: Card[], player?: number) {
    this.cards = cards
    this.cards.sort((a, b) => (a.value > b.value ? 1 : -1))
    this.player = player
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
        return card?.value
      } else if (nums[0] === 0) {
        // Let Ace be a high card.
        nums[0] = 13
        nums.sort(ascending)
        if (nums[0] + 4 === nums[4]) {
          const card = this.cards.find((c) => num(c) === 0)
          return card?.value
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
      return this.cards[1].value
    }
  }

  fullHouse() {
    if (
      this.isSameRank(this.cards.slice(0, 2)) ||
      this.isSameRank(this.cards.slice(2, 5))
    ) {
      return this.cards[2].value
    } else if (
      this.isSameRank(this.cards.slice(0, 3)) &&
      this.isSameRank(this.cards.slice(3, 5))
    ) {
      return this.cards[2].value
    }
  }

  get value() {
    switch (this.cards.length) {
      case 1:
        return this.cards[0].value
      case 2:
        if (this.isSameRank(this.cards)) {
          return this.cards[1].value
        } else {
          console.error("Pair doesn't match")
          break
        }
      case 3:
        if (this.isSameRank(this.cards)) {
          return this.cards[0].value
        } else {
          console.error("Trio doesn't match")
          break
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
          console.error('Invalid 5-card combination')
          break
        } else {
          return combi * 1000 + val
        }
    }
    return null
  }

  get [Symbol.toStringTag]() {
    return this.toString()
  }

  toString() {
    return this.cards.map((c) => `${c.rank}${c.suit}`).join(' ')
  }

  static fromString(s: string) {
    return new Play(s.split(/\s+/).map((c) => Card.fromString(c)))
  }

  static fromState(cards: any[]) {
    return cards.map((c) => new Card(c.rank, c.suit))
  }
}

export type State = {
  hands: Record<number, Card[]>
  firstTurn: number
  hasStarted: boolean
  discardPile: Card[]
  lastPlay: Play | null
  winners: number[]
}

export const PusoyDos: Game = {
  name: 'pusoy-dos',
  minPlayers: 4,
  maxPlayers: 4,

  setup: (ctx): State => {
    const deck = ctx.random!.Shuffle(Card.newDeck())
    const hands: Record<number, Card[]> = {}

    // Deal cards
    let firstTurn = 0
    let player = 0
    while (deck.length > 0) {
      player = Object.keys(hands).length
      const hand = deck.splice(0, 13)
      if (hand.some((c) => c.value === Card.lowest.value)) {
        firstTurn = player
      }
      hands[player] = hand
    }

    return {
      hands,
      firstTurn,
      hasStarted: false,
      discardPile: [],
      lastPlay: null,
      winners: [],
    }
  },

  turn: {
    moveLimit: 1,
    order: {
      first: (G, ctx) => G.firstTurn,
      next: getNext,
    },
  },

  moves: {
    play: (G: State, ctx: Ctx, play: Play) => {
      const hand = G.hands[parseInt(ctx.currentPlayer, 10)]
      const handString = hand.map(String)
      const playValue = play.value

      if (playValue === null) {
        return INVALID_MOVE
      }

      if (!play.cards.every((c) => handString.includes(String(c)))) {
        console.log('Play not from hand')
        return INVALID_MOVE
      }

      if (G.lastPlay === null) {
        if (!G.hasStarted) {
          const isLowestInPlay = play.cards
            .map(String)
            .includes(String(Card.lowest))
          if (!isLowestInPlay) {
            console.log(`First move not ${Card.lowest}`)
            return INVALID_MOVE
          } else {
            G.hasStarted = true
          }
        }
      } else {
        if (G.lastPlay?.cards.length !== play.cards.length) {
          console.log('Play not same length as last play')
          return INVALID_MOVE
        }
        if (playValue < G.lastPlay.value!) {
          console.log('Play value lower that last play')
          return INVALID_MOVE
        }
      }

      // Remove played cards from hand and place in discard pile
      const discard = play.cards.map((card) => {
        return hand.splice(hand.map(String).indexOf(String(card)), 1).pop()!
      })
      G.discardPile.push(...discard)

      G.lastPlay = play

      if (hand.length === 0) {
        G.winners.push(parseInt(ctx.currentPlayer, 10))
        G.lastPlay = null
      }

      ctx.events?.endTurn!()
    },
    pass: (G, ctx) => {
      if (G.lastPlay === null) {
        return INVALID_MOVE
      }
      if (G.lastPlay?.player === getNext(G, ctx)) {
        // Others passed
        G.lastPlay = null
      }
      ctx.events?.endTurn!()
    },
  },

  endIf: (G, ctx) => {
    return G.winners.length === 3
  },
}

function getNext(G: State, ctx: Ctx) {
  let i = 1
  while (true) {
    const nextPlayer = (ctx.playOrderPos + i) % ctx.numPlayers
    if (G.winners.includes(nextPlayer)) {
      console.log(`Skipping player ${nextPlayer}`)
      i++
    } else {
      return nextPlayer
    }
  }
}
