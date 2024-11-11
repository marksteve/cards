import { LobbyClient } from 'boardgame.io/client'
import { BoardProps } from 'boardgame.io/react'
import { range } from 'd3-array'
import firebase from 'firebase/app'
import React, { useEffect } from 'react'
import BoardCard from '../BoardCard'
import BoardHand from '../BoardHand'
import SpectatorHand from '../SpectatorHand'
import OtherHand from '../OtherHand'
import Button from '../Button'
import { toInt } from '../utils'
import styles from './Board.module.css'
import { GAME_ID, State, NUM_CARDS } from './Game'

export default function Board({
  G,
  ctx,
  moves,
  playerID,
  credentials,
  matchData,
  matchID,
}: BoardProps<State>) {
  const onGameStart = () => {
    new Audio('/assets/audio/shuffle.mp3').play()
  }
  useEffect(onGameStart, [])

  const { players, remaining, discarded, lastPlay } = G
  const maxHandCards = NUM_CARDS / ctx.numPlayers

  const currentPlayer = toInt(ctx.currentPlayer)
  const isSpectator = playerID === ''
  const player = toInt(playerID) || 0
  const playerName = (p: number) => (p !== undefined ? matchData![p].name! : '')

  const start = (player + 1) % ctx.numPlayers
  const otherHands = range(start, start + ctx.numPlayers - 1)
    .map((p) => p % ctx.numPlayers)
    .map((p, i) => ({
      player: p,
      name: playerName(p),
      cards: Array(remaining[p]).fill('B1'),
    }))

  useEffect(() => {
    const previousPlayer =
      (toInt(ctx.currentPlayer) + ctx.numPlayers - 1) % ctx.numPlayers
    const previousMove =
      G.lastPlay?.player! === previousPlayer ? 'play' : 'pass'
    new Audio(`/assets/audio/${previousMove}.mp3`).play()
  })

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
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${ctx.numPlayers - 1}, 1fr)`,
      }}
    >
      <OtherHands
        hands={otherHands}
        currentPlayer={currentPlayer}
        maxHandCards={maxHandCards}
        leader={G.leader}
      />
      <Mat discarded={discarded} lastPlayer={playerName(lastPlay?.player!)} />
      {isSpectator ? (
        <SpectatorHand
          name={matchData![player].name!}
          handCount={remaining[player]}
          isCurrent={currentPlayer === player}
          maxHandCards={maxHandCards}
        />
      ) : (
        <BoardHand
          hand={players[player]}
          name={matchData![player].name!}
          onPlay={moves.play}
          onPass={moves.pass}
          isCurrent={currentPlayer === player}
          isLeader={G.leader === player}
          lastPlay={G.lastPlay}
          hasStarted={G.hasStarted}
          currentPlayer={toInt(ctx.currentPlayer)}
        />
      )}
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
    cards: CardStr[]
  }[]
  currentPlayer: number
  maxHandCards: number
  leader: number
}

function OtherHands({ hands, currentPlayer, maxHandCards, leader }: OtherHandsProps) {
  return (
    <>
      {hands.map((hand) => (
        <OtherHand
          key={hand.player}
          name={hand.name}
          hand={hand.cards}
          isCurrent={hand.player === currentPlayer}
          maxHandCards={maxHandCards}
          isLeader={hand.player === leader}
        />
      ))}
    </>
  )
}

type MatProps = {
  discarded: string[][]
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
  cards: CardStr[]
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
