import React, { CSSProperties, useCallback, MouseEvent } from 'react'
import { useLocalStorage, writeStorage } from '@rehooks/local-storage'
import {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'
import styles from './BoardHand.module.css'

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
  const [skin, setSkin] = useLocalStorage<string>('skin', 'cute')

  const classNames = [styles.card]
  if (isActive) {
    classNames.push(styles.cardActive)
  }
  const className = classNames.join(' ')

  const handleClick = useCallback(() => {
    onCardSelect && onCardSelect(card)
  }, [card, onCardSelect])

  const toggleSkin = () => {
    const newSkin = skin == 'cute' ? 'classic' : 'cute'
    writeStorage('skin', newSkin)
    setSkin(newSkin)
  }

  const handleRightClick = (e: MouseEvent) => {
    e.preventDefault()
    toggleSkin()
  }

  const props = {
    src: `${process.env.PUBLIC_URL}/assets/cards/${skin}/${card}.png`,
    onClick: handleClick,
    onContextMenu: handleRightClick,
  }

  if (!draggable) {
    const style = { '--rotation': `${rotation || 0}deg` } as CSSProperties
    return (
      <div data-board-card className={className} style={style}>
        <img alt={card} {...props} />
      </div>
    )
  }

  const [provided] = draggable

  return (
    <div
      data-board-card
      className={className}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <img alt={card} {...props} />
    </div>
  )
}
