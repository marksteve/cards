import { useLocalStorage } from '@rehooks/local-storage'
import { LobbyAPI } from 'boardgame.io'
import { LobbyClient } from 'boardgame.io/client'
import { SocketIO } from 'boardgame.io/multiplayer'
import { Client } from 'boardgame.io/react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import React, { ChangeEvent, useEffect, useMemo } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import PusoyDosBoard from './Board'
import { PusoyDos } from './Game'
import styles from './Lobby.module.css'

const GAME_ID = 'pusoy-dos'
const NUM_PLAYERS = 4
const firebaseConfig = {
  apiKey: 'AIzaSyCUS1V4vpUDVVwbBFJcyf5twLVLfQEutUQ',
  authDomain: 'playground-163312.firebaseapp.com',
  databaseURL: 'https://playground-163312.firebaseio.com',
  projectId: 'playground-163312',
  storageBucket: 'playground-163312.appspot.com',
  messagingSenderId: '908109866828',
  appId: '1:908109866828:web:64e3cd0a0058ccdd9e51e9',
}
firebase.initializeApp(firebaseConfig)

export default function Lobby() {
  const matchID = window.location.pathname.replace(/\//g, '')
  const lobbyClient = useMemo(
    () => new LobbyClient({ server: process.env.REACT_APP_LOBBY_SERVER }),
    []
  )

  async function handleCreate() {
    const { matchID } = await lobbyClient.createMatch(GAME_ID, {
      numPlayers: NUM_PLAYERS,
    })
    await firebase.firestore().collection('matches').doc(matchID).set({
      players: [],
    })
    window.location.href = `/${matchID}`
  }

  return (
    <div className={styles.lobby}>
      {matchID ? (
        <Match matchID={matchID} lobbyClient={lobbyClient} />
      ) : (
        <button onClick={handleCreate}>Create Game</button>
      )}
    </div>
  )
}

type MatchProps = {
  matchID: string
  lobbyClient: LobbyClient
}

function Match({ matchID, lobbyClient }: MatchProps) {
  const matchRef = firebase.firestore().doc(`matches/${matchID}`)
  const [match] = useDocumentData<LobbyAPI.Match>(matchRef)
  const [player, setPlayer] = useLocalStorage<Record<string, string>>(matchID, {
    id: '',
    name: '',
    credentials: '',
  })

  function updateMatch() {
    lobbyClient.getMatch(GAME_ID, matchID).then((match) => {
      matchRef.set(match)
    })
  }

  useEffect(updateMatch, [])

  if (!match) {
    return null
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setPlayer({ ...player, name: e.target.value })
  }

  function handleJoin() {
    if (player.name === '') {
      return
    }
    for (const { id, name } of match?.players || []) {
      if (!name) {
        lobbyClient
          .joinMatch(GAME_ID, matchID, {
            playerID: `${id}`,
            playerName: player.name,
          })
          .then(({ playerCredentials }) => {
            setPlayer({
              ...player,
              id: `${id}`,
              credentials: playerCredentials,
            })
            updateMatch()
          })
        break
      }
    }
  }

  let content = null
  if (match.players.every((player) => player.name)) {
    content = (
      <Game
        matchID={matchID}
        playerID={player.id}
        credentials={player.credentials}
      />
    )
  } else if (player.credentials.length) {
    content = (
      <div className={styles.players}>{JSON.stringify(match.players)}</div>
    )
  } else {
    content = (
      <>
        {JSON.stringify(match.players)}
        <input type="text" onChange={handleNameChange} value={player.name} />
        <button onClick={handleJoin}>Join Game</button>
      </>
    )
  }

  return <div className={styles.match}>{content}</div>
}

const Game = Client({
  game: PusoyDos,
  numPlayers: NUM_PLAYERS,
  board: PusoyDosBoard,
  multiplayer: SocketIO({ server: process.env.REACT_APP_GAME_SERVER }),
  debug: false,
})
