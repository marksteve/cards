import { LobbyClient } from 'boardgame.io/client'
import { BoardProps } from 'boardgame.io/react'
import { range } from 'd3-array'
import firebase from 'firebase/app'
import React from 'react'
import styles from './Board.module.css'
import BoardCard from './BoardCard'
import BoardHand from './BoardHand'
import Button from './Button'
import { Card, GAME_ID, State } from './Game'
import { toInt } from './utils'

export default function PusoyDosBoard({
  G,
  ctx,
  moves,
  playerID,
  credentials,
  matchData,
  matchID,
}: BoardProps<State>) {
  const { players, remaining, discarded } = G

  const currentPlayer = toInt(ctx.currentPlayer)
  const player = toInt(playerID)
  const playerName = (p: number) => matchData![p].name!

  const start = (player + 1) % ctx.numPlayers
  const otherHands = range(start, start + ctx.numPlayers - 1)
    .map((p) => p % ctx.numPlayers)
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

  async function handlePlayAgain() {
    const lobbyClient = new LobbyClient({
      server: process.env.REACT_APP_LOBBY_SERVER,
    })
    const { nextMatchID } = await lobbyClient.playAgain(GAME_ID, matchID, {
      playerID: playerID!,
      credentials: credentials!,
    })
    const matchRef = firebase.firestore().doc(`matches/${matchID}`)
    matchRef.set({ nextMatchID }, { merge: true })
  }

  return (
    <div className={styles.board}>
      <OtherHands hands={otherHands} currentPlayer={currentPlayer} />
      <Mat discarded={discarded.map((cards) => cards.map(Card.fromString))} />
      <BoardHand
        cards={players[player].map(Card.fromString)}
        name={matchData![player].name!}
        onPlay={handlePlay}
        onPass={handlePass}
        isCurrent={currentPlayer === player}
        isPlayer
      />
      <GameOver
        gameover={ctx.gameover}
        winners={G.winners.map(playerName)}
        onPlayAgain={handlePlayAgain}
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
          cards={hand.cards}
          isCurrent={currentPlayer === hand.player}
        />
      ))}
    </>
  )
}

type MatProps = {
  discarded: Card[][]
}

function Mat({ discarded }: MatProps) {
  return (
    <div className={styles.mat}>
      {discarded.map((cards, i) => (
        <Play key={i} cards={cards} isActive={i === discarded.length - 1} />
      ))}
    </div>
  )
}

type PlayProps = {
  cards: Card[]
  isActive: boolean
}

function Play({ cards, isActive }: PlayProps) {
  return (
    <div className={styles.play}>
      {cards.map((card, i) => {
        const rotation = 10 * (i - (cards.length - 1) / 2)
        return (
          <BoardCard
            key={i}
            card={card}
            rotation={rotation}
            isActive={isActive}
          />
        )
      })}
    </div>
  )
}

type GameOverProps = {
  gameover: boolean
  winners: string[]
  onPlayAgain: () => void
}

function GameOver({ gameover, winners, onPlayAgain }: GameOverProps) {
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
        <Button onClick={onPlayAgain}>Play Again</Button>
      </div>
    </div>
  )
}
