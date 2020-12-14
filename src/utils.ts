import { Card } from './Game'

export const toInt = (playerID: string | null) => parseInt(String(playerID), 10)

export const includesCard = (cards: Card[], card: Card) =>
  cards.map(String).includes(String(card))
