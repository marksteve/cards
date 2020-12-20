export const toInt = (playerID: string | null) => parseInt(String(playerID), 10)

export const includesCard = (cards: any[], card: any) =>
  cards.map(String).includes(String(card))
