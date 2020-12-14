import React, { CSSProperties, useCallback } from 'react'
import {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'
import styles from './Board.module.css'
import { CardStr } from './Game'

type BoardCardProps = {
  card: CardStr
  onCardSelect?: (card: CardStr) => void
  isActive?: boolean
  draggable?: [DraggableProvided, DraggableStateSnapshot, DraggableRubric]
  rotation?: number
}

export default function BoardCard({
  card,
  onCardSelect,
  isActive,
  draggable,
  rotation,
}: BoardCardProps) {
  const classNames = [styles.card]
  if (isActive) {
    classNames.push(styles.cardActive)
  }
  const className = classNames.join(' ')

  const handleClick = useCallback(() => {
    onCardSelect && onCardSelect(card)
  }, [card, onCardSelect])

  const props = {
    src: `${process.env.PUBLIC_URL}/assets/cards/${card}.png`,
    onClick: handleClick,
  }

  if (!draggable) {
    const style = { '--rotation': `${rotation || 0}deg` } as CSSProperties
    return (
      <div className={className} style={style}>
        <img alt={card} {...props} />
      </div>
    )
  }

  const [provided] = draggable

  return (
    <div
      className={className}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <img alt={card} {...props} />
    </div>
  )
}
