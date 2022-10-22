import React, { useEffect, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import { Card, Play, isValidMove } from './dos/Game'
import BoardCard from './BoardCard'
import styles from './BoardHand.module.css'
import Button from './Button'

type BoardHandProps = {
  hand: CardStr[]
  name: string
  onPlay: (cards: CardStr[]) => void
  onPass: () => void
  isCurrent: boolean
  isLeader: boolean
  lastPlay: Play | null
  hasStarted: boolean
  currentPlayer: number
}

export default function BoardHand({
  hand,
  name,
  onPlay,
  onPass,
  isCurrent,
  isLeader,
  lastPlay,
  hasStarted,
  currentPlayer,
}: BoardHandProps) {
  const classNames = [styles.hand]
  isCurrent && classNames.push(styles.handCurrent)
  classNames.push(styles.handPlayer)

  const [selected, setSelected] = useState<CardStr[]>([])
  const [ordered, setOrdered] = useState<CardStr[]>(hand)

  useEffect(() => {
    setOrdered((ordered) => ordered.filter((card) => hand.includes(card)))
  }, [hand, setOrdered])

  function sortHand() {
    setOrdered([
      ...ordered.sort((c1, c2) => {
        const [v1, v2] = [c1, c2].map((x) => Card.fromString(x).value)
        return v1 - v2
      }),
    ])
  }

  function handleCardSelect(card: CardStr) {
    if (!isCurrent) {
      return
    }
    setSelected((selected) =>
      selected.includes(card)
        ? selected.filter((c) => c !== card)
        : [...selected, card]
    )
  }

  function handlePlay() {
    onPlay(selected)
    setSelected([])
  }

  function handlePass() {
    onPass()
    setSelected([])
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) {
      return
    }
    setOrdered(reorder(ordered, result.source.index, result.destination.index))
  }

  function isPlayable(selection: CardStr[]) {
    const play = Play.fromString(selection, currentPlayer)
    return isValidMove(hand, isLeader, lastPlay, hasStarted, play)
  }

  const canPass = !isLeader

  const actions = isCurrent ? (
    <div className={styles.actions}>
      <button onClick={handlePlay} disabled={!isPlayable(selected)}>
        Play
      </button>
      <Button onClick={sortHand}>Sort</Button>
      <Button onClick={handlePass} disabled={!canPass}>
        Pass
      </Button>
    </div>
  ) : (
    <div className={styles.actions}>
      <Button onClick={sortHand}>Sort</Button>
    </div>
  )

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
