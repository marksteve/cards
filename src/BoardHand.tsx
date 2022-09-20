import React, { useEffect, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import { Play } from './dos/Game'
import BoardCard from './BoardCard'
import styles from './BoardHand.module.css'
import Button from './Button'

type BoardHandProps = {
  name: string
  cards: CardStr[]
  onPlay?: (cards: CardStr[]) => void
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

  const [selected, setSelected] = useState<CardStr[]>([])
  const [ordered, setOrdered] = useState<CardStr[]>(cards)

  useEffect(() => {
    setOrdered((ordered) => ordered.filter((card) => cards.includes(card)))
  }, [cards, setOrdered])

  function sortHand() {
    setOrdered([...ordered.sort((c1, c2) => {
      const [v1, v2] = [c1, c2].map(x => Play.fromString(x).value)
      return v1 - v2
    })])
  }

  function handleCardSelect(card: CardStr) {
    if (!canPlay) {
      return
    }
    setSelected((selected) =>
      selected.includes(card)
        ? selected.filter((c) => c !== card)
        : [...selected, card]
    )
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
      <Button onClick={sortHand}>Sort</Button>
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
                <Draggable key={card} draggableId={card} index={i}>
                  {(...draggable) => (
                    <BoardCard
                      card={card}
                      onCardSelect={handleCardSelect}
                      isActive={selected.includes(card)}
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
