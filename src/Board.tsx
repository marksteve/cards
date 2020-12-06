import { BoardProps } from 'boardgame.io/react'
import React, { useCallback, useState } from 'react'
import styles from './Board.module.css'
import { Card, State } from './Game'
import { toInt } from './utils'

export default function PusoyDosBoard({
  G,
  ctx,
  moves,
  playerID,
  matchData,
  reset,
}: BoardProps<State>) {
  const { hands, discardPile } = G
  const currentPlayer = toInt(ctx.currentPlayer)
  const player = toInt(playerID)
  const playerName = (p: number) => matchData![p].name!
  const otherHands = Object.keys(hands)
    .map(toInt)
    .filter((p) => p !== player)
    .map((p) => ({
      player: p,
      name: playerName(p),
      cards: hands[p].map(Card.fromString),
    }))
  function handlePlay(cards: Card[]) {
    moves.play(cards.map(String))
  }
  function handlePass() {
    moves.pass()
  }
  return (
    <div className={styles.board}>
      <OtherHands hands={otherHands} currentPlayer={currentPlayer} />
      <Mat cards={discardPile.map(Card.fromString)} />
      <BoardHand
        hand={hands[player].map(Card.fromString)}
        name={matchData![player].name!}
        onPlay={handlePlay}
        onPass={handlePass}
        isCurrent={currentPlayer === player}
        isPlayer
      />
      <GameOver
        gameover={ctx.gameover}
        winners={G.winners.map(playerName)}
        onReset={reset}
      />
    </div>
  )
}

type OtherHandsProps = {
  hands: {
    player: number
    name: string
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
          name={hand.name}
          hand={hand.cards}
          isCurrent={currentPlayer === hand.player}
        />
      ))}
    </>
  )
}

type BoardHandProps = {
  name: string
  hand: Card[]
  onPlay?: (cards: Card[]) => void
  onPass?: () => void
  isCurrent?: boolean
  isPlayer?: boolean
}

function BoardHand({
  hand,
  name,
  onPlay,
  onPass,
  isCurrent,
  isPlayer,
}: BoardHandProps) {
  const classNames = [styles.hand]
  isCurrent && classNames.push(styles.handCurrent)
  isPlayer && classNames.push(styles.handPlayer)
  const canPlay = isCurrent && isPlayer
  const [cards, setCards] = useState<Card[]>([])
  function handleCardSelect(card: Card) {
    if (!canPlay) {
      return
    }
    setCards([...cards, card])
  }
  function handlePlay() {
    if (!canPlay || !onPlay) {
      return
    }
    onPlay(cards)
    setCards([])
  }
  function handlePass() {
    if (!canPlay || !onPass) {
      return
    }
    onPass()
    setCards([])
  }
  const actions = canPlay ? (
    <div>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePass}>Pass</button>
    </div>
  ) : null
  return (
    <div className={classNames.join(' ')}>
      <h2>
        {name}
        {actions}
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

type GameOverProps = {
  gameover: boolean
  winners: string[]
  onReset: () => void
}

function GameOver({ gameover, winners, onReset }: GameOverProps) {
  if (!gameover) {
    return null
  }
  return (
    <div className={styles.gameover}>
      <div className="dialog">
        <h2>Good Game!</h2>
        <ol className={styles.winners}>
          {winners.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ol>
        <button onClick={onReset}>Play Again</button>
      </div>
    </div>
  )
}