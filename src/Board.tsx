import { BoardProps } from 'boardgame.io/react'
import { range } from 'd3-array'
import React, { useCallback, useState } from 'react'
import styles from './Board.module.css'
import Button from './Button'
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
  const { players, remaining, discarded } = G

  const currentPlayer = toInt(ctx.currentPlayer)
  const player = toInt(playerID)
  const playerName = (p: number) => matchData![p].name!

  const start = (player + 1) % ctx.numPlayers
  const otherHands = range(start, (start + ctx.numPlayers - 1) % ctx.numPlayers)
    .filter((p) => p !== player)
    .map((p, i) => ({
      player: p,
      name: playerName(p),
      cards: Array(remaining[p]).fill('B1'),
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
      <Mat discarded={discarded.map((cards) => cards.map(Card.fromString))} />
      <BoardHand
        hand={players[player].map(Card.fromString)}
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
    <div className={styles.actions}>
      <Button onClick={handlePlay}>Play</Button>
      <Button onClick={handlePass}>Pass</Button>
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
  discarded: Card[][]
}

function Mat({ discarded }: MatProps) {
  return (
    <div className={styles.mat}>
      {discarded.map((cards, i) => (
        <Play key={i} cards={cards} />
      ))}
    </div>
  )
}

type PlayProps = {
  cards: Card[]
}

function Play({ cards }: PlayProps) {
  return (
    <div className={styles.play}>
      {cards.map((card) => (
        <BoardCard key={String(card)} card={card} />
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
        <Button onClick={onReset}>Play Again</Button>
      </div>
    </div>
  )
}
