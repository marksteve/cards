import React from 'react'
import BoardCard from './BoardCard'
import styles from './BoardHand.module.css'

type OtherHandProps = {
  name: string
  hand: CardStr[]
  isCurrent: boolean
  maxHandCards: number
  isLeader: boolean
}

export default function OtherHand({
  name,
  hand,
  isCurrent,
  maxHandCards,
  isLeader,
}: OtherHandProps) {
  const classNames = [styles.hand]
  isCurrent && classNames.push(styles.handCurrent)

  return (
    <div className={classNames.join(' ')}>
      <h2>
        {name} {isLeader ? '👑' : null}
      </h2>
      <div
        className={styles.handCards}
        style={{ gridTemplateColumns: `repeat(auto-fill, calc(100% / ${17}))` }}
      >
        {hand.map((card, i) => (
          <BoardCard key={i} card={card} />
        ))}
      </div>
    </div>
  )
}
