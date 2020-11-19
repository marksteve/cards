import { BoardProps } from 'boardgame.io/react'
import React, { useCallback, useState } from 'react'
import styles from './Board.module.css'
import { Card, Play } from './Game'

export default function PusoyDosBoard({ G, ctx, moves }: BoardProps) {
  const { hands } = G
  const { currentPlayer } = ctx
  console.log(ctx)
  return (
    <div className={styles.board}>
      <BoardHand
        hand={hands[1]}
        player={0}
        isCurrent={currentPlayer === '0'}
        moves={moves}
      />
      <BoardHand
        hand={hands[1]}
        player={1}
        isCurrent={currentPlayer === '1'}
        moves={moves}
      />
      <BoardHand
        hand={hands[2]}
        player={2}
        isCurrent={currentPlayer === '2'}
        moves={moves}
      />
      <Mat></Mat>
      <BoardHand
        hand={hands[3]}
        player={3}
        isCurrent={currentPlayer === '3'}
        isPlayer
        moves={moves}
      />
    </div>
  )
}

type BoardHandProps = {
  hand: Card[]
  player: number
  isCurrent?: boolean
  isPlayer?: boolean
  moves: any
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
    moves.play(new Play(cards))
  }
  return (
    <div className={classNames.join(' ')}>
      <h2>
        PLAYER {player + 1}
        <Button onClick={handlePlay}>Play</Button>
      </h2>
      {hand.map((card) => (
        <BoardCard
          key={String(card)}
          card={card}
          onCardSelect={handleCardSelect}
        />
      ))}
    </div>
  )
}

type BoardCardProps = { card: Card; onCardSelect: (card: Card) => void }

function BoardCard({ card, onCardSelect }: BoardCardProps) {
  const handleClick = useCallback(() => {
    onCardSelect(card)
  }, [card, onCardSelect])
  return (
    <img
      onClick={handleClick}
      src={`${process.env.PUBLIC_URL}/assets/cards/${card}.png`}
      alt={String(card)}
    />
  )
}

type MatProps = React.PropsWithChildren<{}>

function Mat({ children }: MatProps) {
  return <div className={styles.mat}>{children}</div>
}

type ButtonProps = React.ButtonHTMLAttributes<{}>

function Button(props: ButtonProps) {
  return <button className={styles.button} {...props} />
}
