import React, { useEffect, useState } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd'
import styles from './Board.module.css'
import BoardCard from './BoardCard'
import Button from './Button'
import { Card } from './Game'

type BoardHandProps = {
  name: string
  cards: Card[]
  onPlay?: (cards: Card[]) => void
  onPass?: () => void
  isCurrent?: boolean
  isPlayer?: boolean
}

export default function BoardHand({
  cards,
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

  const [selected, setSelected] = useState<Card[]>([])
  const [ordered, setOrdered] = useState<Card[]>(cards)

  useEffect(() => {
    setOrdered((ordered) =>
      ordered.filter((card) => cards.map(String).includes(String(card)))
    )
  }, [cards, setOrdered])

  function handleCardSelect(card: Card) {
    if (!canPlay) {
      return
    }
    setSelected([...selected, card])
  }

  function handlePlay() {
    if (!canPlay || !onPlay) {
      return
    }
    onPlay(selected)
    setSelected([])
  }

  function handlePass() {
    if (!canPlay || !onPass) {
      return
    }
    onPass()
    setSelected([])
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) {
      return
    }
    setOrdered(reorder(ordered, result.source.index, result.destination.index))
  }

  const actions = canPlay ? (
    <div className={styles.actions}>
      <Button onClick={handlePlay}>Play</Button>
      <Button onClick={handlePass}>Pass</Button>
    </div>
  ) : null

  if (!isPlayer) {
    return (
      <div className={classNames.join(' ')}>
        <h2>
          {name}
          {actions}
        </h2>
        <div className={styles.handCards}>
          {cards.map((card, i) => (
            <BoardCard key={i} card={card} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={classNames.join(' ')}>
      <h2>
        {name}
        {actions}
      </h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided) => (
            <div className={styles.handCards} ref={provided.innerRef}>
              {ordered.map((card, i) => (
                <Draggable
                  key={String(card)}
                  draggableId={String(card)}
                  index={i}
                >
                  {(...draggable) => (
                    <BoardCard
                      card={card}
                      onCardSelect={handleCardSelect}
                      isActive={selected.map(String).includes(String(card))}
                      draggable={draggable}
                    />
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

function reorder(list: any[], startIndex: number, endIndex: number) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}