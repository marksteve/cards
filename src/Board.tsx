import { BoardProps } from 'boardgame.io/react'
import React, { useCallback, useState } from 'react'
import styles from './Board.module.css'
import { Card, Play, State } from './Game'

const toInt = (playerID: string | null) => parseInt(String(playerID), 10)

export default function PusoyDosBoard({
  G,
  ctx,
  moves,
  playerID,
}: BoardProps<State>) {
  const { hands, discardPile } = G
  const currentPlayer = toInt(ctx.currentPlayer)
  const player = toInt(playerID)
  const otherHands = Object.keys(hands)
    .filter((p) => toInt(p) !== player)
    .map((p) => ({
      player: toInt(p),
      cards: hands[toInt(p)].map(Card.fromState),
    }))
  return (
    <div className={styles.board}>
      <OtherHands hands={otherHands} currentPlayer={currentPlayer} />
      <Mat cards={discardPile} />
    </div>
  )
}

type OtherHandsProps = {
  hands: {
    player: number
    cards: Card[]
  }[]
  currentPlayer: number
}

function OtherHands({ hands, currentPlayer }: OtherHandsProps) {
  return (
    <>
      {hands.map((hand) => (
        <BoardHand
          key={hand.player}
          hand={hand.cards}
          player={hand.player}
          isCurrent={currentPlayer === 0}
        />
      ))}
    </>
  )
}

type BoardHandProps = {
  hand: Card[]
  player: number
  isCurrent?: boolean
  isPlayer?: boolean
  moves?: any
}

function BoardHand({
  hand,
  player,
  isCurrent,
  isPlayer,
  moves,
}: BoardHandProps) {
  const classNames = [styles.hand]
  isCurrent && classNames.push(styles.handCurrent)
  isPlayer && classNames.push(styles.handPlayer)
  const [cards, setCards] = useState<Card[]>([])
  function handleCardSelect(card: Card) {
    setCards([...cards, card])
  }
  function handlePlay() {
    moves.play(new Play(cards, player))
    setCards([])
  }
  function handlePass() {
    moves.pass()
    setCards([])
  }
  return (
    <div className={classNames.join(' ')}>
      <h2>
        PLAYER {player + 1}
        <Button onClick={handlePlay}>Play</Button>
        <Button onClick={handlePass}>Pass</Button>
      </h2>
      {hand.map((card) => (
        <BoardCard
          key={String(card)}
          card={card}
          onCardSelect={handleCardSelect}
          isActive={cards.map(String).includes(String(card))}
        />
      ))}
    </div>
  )
}

type BoardCardProps = {
  card: Card
  onCardSelect?: (card: Card) => void
  isActive?: boolean
}

function BoardCard({ card, onCardSelect, isActive }: BoardCardProps) {
  const handleClick = useCallback(() => {
    onCardSelect && onCardSelect(card)
  }, [card, onCardSelect])
  return (
    <img
      onClick={handleClick}
      src={`${process.env.PUBLIC_URL}/assets/cards/${card}.png`}
      alt={String(card)}
      className={isActive ? styles.handActive : ''}
    />
  )
}

type MatProps = {
  cards: Card[]
}

function Mat({ cards }: MatProps) {
  return (
    <div className={styles.mat}>
      {cards.map((card) => (
        <BoardCard
          key={String(card)}
          card={card}
          isActive={cards.map(String).includes(String(card))}
        />
      ))}
    </div>
  )
}

type ButtonProps = React.ButtonHTMLAttributes<{}>

function Button(props: ButtonProps) {
  return <button className={styles.button} {...props} />
}
