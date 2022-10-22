import React from 'react'
import BoardCard from './BoardCard'
import styles from './BoardHand.module.css'

type OtherHandProps = {
  name: string
  hand: CardStr[]
  isCurrent: boolean
}

export default function OtherHand({ name, hand, isCurrent }: OtherHandProps) {
  const classNames = [styles.hand]
  if (isCurrent) {
    classNames.push(styles.handCurrent)
  }

  return (
    <div className={classNames.join(' ')}>
      <h2>{name}</h2>
      <div className={styles.handCards}>
        {hand.map((card, i) => (
          <BoardCard key={i} card={card} />
        ))}
      </div>
    </div>
  )
}
