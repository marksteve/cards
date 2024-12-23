import { Ctx, Game } from 'boardgame.io'
import { INVALID_MOVE, PlayerView } from 'boardgame.io/core'
import { SocketIO } from 'boardgame.io/multiplayer'
import { Client } from 'boardgame.io/react'
import { ascending } from 'd3-array'
import React from 'react'
import { toInt } from '../utils'

export const GAME_ID = 'dos'

const RANKS = '3456789TJQKA2'
const SUITS = 'CSHD'
export const NUM_CARDS = RANKS.length * SUITS.length

enum Combi {
  None,
  Straight,
  Flush,
  FullHouse,
  Quadro,
  StraightFlush,
}

const getCardValue = (card: Card) => {
  return RANKS.indexOf(card.rank) * SUITS.length + SUITS.indexOf(card.suit)
}

export class Card {
  rank: string
  suit: string

  constructor(rank: string, suit: string) {
    this.rank = rank
    this.suit = suit
  }

  get value() {
    return getCardValue(this)
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

const getPlayValue = (cards: Card[]): number | null => {
  switch (cards.length) {
    case 1:
      return getCardValue(cards[0])
    case 2:
      if (withSameRank(cards).has(2)) {
        return getCardValue(cards[1])
      } else {
        console.error("Pair doesn't match")
        break
      }
    case 3:
      if (withSameRank(cards).has(3)) {
        return getCardValue(cards[0])
      } else {
        console.error("Trio doesn't match")
        break
      }
    case 5:
      const [combi, val] = (() => {
        let val = straight(cards)
        if (val) {
          if (flush(cards)) {
            return [Combi.StraightFlush, val]
          } else {
            return [Combi.Straight, val]
          }
        } else {
          if ((val = quadro(cards))) {
            return [Combi.Quadro, val]
          } else if ((val = fullHouse(cards))) {
            return [Combi.FullHouse, val]
          } else if ((val = flush(cards))) {
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

const withSameRank = (cards: Card[]) => {
  const freqs = cards.reduce<Record<string, number>>(
    (freqs, { rank }) => ({
      ...freqs,
      [rank]: (freqs[rank] || 0) + 1,
    }),
    {}
  )
  return new Set(Object.values(freqs))
}

const straight = (cards: Card[]) => {
  const num = (card: Card) => {
    const r = RANKS.indexOf(card.rank)
    return (r + 2) % 13
  }
  const numSet = new Set(cards.map(num))
  if (numSet.size === 5) {
    const nums = Array.from(numSet)
    nums.sort(ascending)
    if (nums[0] + 4 === nums[4]) {
      // Use the value of the highest (by num) card.
      const card = cards.find((c) => num(c) === nums[4])
      return card?.value
    } else if (nums[0] === 0) {
      // Let Ace be a high card.
      nums[0] = 13
      nums.sort(ascending)
      if (nums[0] + 4 === nums[4]) {
        const card = cards.find((c) => num(c) === 0)
        return card?.value
      }
    }
  }
}

const flush = (cards: Card[]) => {
  if (cards.every((c) => c.suit === cards[0].suit)) {
    return SUITS.indexOf(cards[4].suit) * 13 + RANKS.indexOf(cards[4].rank)
  }
}

const quadro = (cards: Card[]) => {
  if (withSameRank(cards).has(4)) {
    // Cards are sorted so any of the 3 middle cards will be part of the quadro
    return cards[1].value
  }
}

const fullHouse = (cards: Card[]) => {
  const freqs = withSameRank(cards)
  if (freqs.has(2) && freqs.has(3)) {
    // Cards are sorted so the middle card will always be part of the trio
    return cards[2].value
  }
}

export class Play {
  cards: Card[]
  player?: number

  constructor(cards: Card[], player?: number) {
    this.cards = cards
    this.cards.sort((a, b) => (a.value > b.value ? 1 : -1))
    this.player = player
  }

  get value() {
    return getPlayValue(this.cards)
  }

  get [Symbol.toStringTag]() {
    return this.toString()
  }

  toString() {
    return this.cards.map((c) => `${c.rank}${c.suit}`).join(' ')
  }

  static fromString(s: CardStr | CardStr[], player?: number) {
    const cards = typeof s === 'string' ? s.split(/\s+/) : s
    return new Play(cards.map(Card.fromString), player)
  }
}

export const isValidMove = (
  hand: CardStr[],
  isLeader: boolean,
  lastPlay: Play | null | undefined,
  hasStarted: boolean | undefined,
  play: Play
) => {
  const playString = play.cards.map(String)

  if (play.value === null) {
    console.log('Invalid move')
    return false
  }

  if (!playString.every((c) => hand.includes(c))) {
    console.log('Play not from hand', { hand, play })
    return false
  }

  if (isLeader) {
    if (!hasStarted) {
      const isLowestInPlay = playString.includes(String(Card.lowest))
      if (!isLowestInPlay) {
        console.log(`First move not ${Card.lowest}`)
        return false
      }
    }
  } else {
    if (lastPlay?.cards.length !== play.cards.length) {
      console.log('Play not same length as last play')
      return false
    }
    const lastPlayValue = getPlayValue(lastPlay?.cards)
    if (!lastPlayValue) {
      console.error(`Last play was invalid: ${JSON.stringify(lastPlay)}`)
    } else if (play.value < lastPlayValue) {
      console.log('Play value lower than last play')
      return false
    }
  }

  return true
}

export type State = {
  players: Record<number, CardStr[]>
  remaining: Record<number, number>
  leader: number
  hasStarted: boolean
  discarded: CardStr[][]
  lastPlay: Play | null
  winners: number[]
}

export const Dos: Game<State> = {
  name: GAME_ID,
  minPlayers: 3,
  maxPlayers: 4,
  playerView: PlayerView.STRIP_SECRETS,

  setup: (ctx): State => {
    let deck = ctx.random!.Shuffle(Card.newDeck())
    const players: Record<number, CardStr[]> = {}
    const remaining: Record<number, number> = {}

    // Remove excess card(s) making sure that the 3 of clubs is still there
    const excess = NUM_CARDS % ctx.numPlayers
    while (deck.slice(0, excess).some((c) => c.value === Card.lowest.value)) {
      deck = ctx.random!.Shuffle(Card.newDeck())
    }
    deck.splice(0, excess)

    // Deal cards
    let player = 0
    const cardsPerPlayer = Math.floor(NUM_CARDS / ctx.numPlayers)
    while (deck.length > 0) {
      player = Object.keys(players).length
      const hand = deck.splice(0, cardsPerPlayer)
      players[player] = hand.map(String)
      remaining[player] = hand.length
    }

    // Determine who starts as leader
    let leader = -1
    for (let player = 0; player < ctx.numPlayers; player++) {
      const hand = players[player]
      if (hand.some((c) => c === '3C')) {
        leader = player
        break
      }
    }
    if (leader === -1) {
      console.error("Couldn't determine leader! Missing 3 of clubs?")
    }

    return {
      players,
      remaining,
      leader,
      hasStarted: false,
      discarded: [],
      lastPlay: null,
      winners: [],
    }
  },

  turn: {
    moveLimit: 1,
    order: {
      first: (G, ctx) => G.leader,
      next: getNextPlayer,
    },
  },

  moves: {
    play: {
      move: (G: State, ctx: Ctx, cards: CardStr[]) => {
        const currentPlayerInt = toInt(ctx.currentPlayer)
        const hand = G.players[currentPlayerInt]
        const isLeader = G.leader === ctx.playOrderPos
        const play = Play.fromString(cards, currentPlayerInt)

        if (!isValidMove(hand, isLeader, G.lastPlay, G.hasStarted, play)) {
          return INVALID_MOVE
        }

        G.hasStarted = true

        const playString = play.cards.map(String)

        // Remove played cards from hand and place in discard pile
        const discard = playString.map((card) => {
          return hand.splice(hand.indexOf(card), 1).pop()!
        })
        G.discarded.push(discard)

        G.lastPlay = play

        if (hand.length) {
          G.leader = currentPlayerInt
        } else {
          G.winners.push(currentPlayerInt)
          G.leader = getNextPlayer(G, ctx)
        }

        G.remaining[currentPlayerInt] = hand.length

        ctx.events?.endTurn!()
      },
      client: false,
    },
    pass: {
      move: (G, ctx) => ctx.events?.endTurn!(),
      client: false,
    },
  },

  endIf: (G, ctx) => {
    return G.winners.length === 3
  },
}

function getNextPlayer(G: State, ctx: Ctx): number {
  return [1, 2, 3]
    .map((i) => (ctx.playOrderPos + i) % ctx.numPlayers)
    .filter((player) => !G.winners.includes(player))[0]
}

export default Client({
  game: Dos,
  board: React.lazy(() => import('./Board')),
  multiplayer: SocketIO({ server: process.env.REACT_APP_GAME_SERVER }),
  debug: false,
})
