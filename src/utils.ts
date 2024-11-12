export const toInt = (playerID: string | null) => parseInt(String(playerID), 10)

export const includesCard = (cards: any[], card: any) =>
  cards.map(String).includes(String(card))

export const getHandStyle = (maxHandCards: number) => ({
  gridTemplateColumns: `repeat(auto-fill, calc(100% / ${maxHandCards}))`,
})
