import React from 'react'
import BoardCard from './BoardCard'
import styles from './BoardHand.module.css'
import { getHandStyle } from './utils'

type SpectatorHandProps = {
  name: string
  handCount: number
  isCurrent: boolean
  maxHandCards: number
}

export default function SpectatorHand({
  name,
  handCount,
  isCurrent,
  maxHandCards,
}: SpectatorHandProps) {
  const classNames = [styles.hand]
  isCurrent && classNames.push(styles.handCurrent)
  classNames.push(styles.handPlayer)

  const hand = Array(handCount).fill('B1')

  return (
    <div className={classNames.join(' ')}>
      <h2>{name}</h2>
      <div className={styles.handCards} style={getHandStyle(maxHandCards)}>
        {hand.map((card, i) => (
          <BoardCard key={i} card={card} />
        ))}
      </div>
    </div>
  )
}
