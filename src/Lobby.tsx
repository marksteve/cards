import { useLocalStorage, writeStorage } from '@rehooks/local-storage'
import { LobbyAPI, Server } from 'boardgame.io'
import { LobbyClient } from 'boardgame.io/client'
import firebase from 'firebase/app'
import React, {
  ChangeEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import Button from './Button'
import styles from './Lobby.module.css'
import { toInt } from './utils'

const GAME_ID = process.env.REACT_APP_GAME_ID!
const GAME_NAME = process.env.REACT_APP_GAME_NAME
const GAME_DESCRIPTION = process.env.REACT_APP_GAME_DESCRIPTION
const NUM_PLAYERS = toInt(process.env.REACT_APP_NUM_PLAYERS!)

const Game = React.lazy(() => import(`./${GAME_ID}/Game`))

export default function Lobby() {
  const matchID = window.location.pathname.replace(/\//g, '')
  const lobbyClient = useMemo(
    () => new LobbyClient({ server: process.env.REACT_APP_LOBBY_SERVER }),
    []
  )
  const [playerName, setPlayerName] = useState<string>('')
  const [createGameClicked, setCreateGameClicked] = useState<boolean>(false)

  if (matchID) {
    return <MatchLobby matchID={matchID} lobbyClient={lobbyClient} />
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setPlayerName(e.target.value.trim())
  }

  async function handleCreate() {
    if (!playerName.length) {
      alert('You need to have a name!')
      return
    }
    setCreateGameClicked(true)
    const { matchID } = await lobbyClient.createMatch(GAME_ID, {
      numPlayers: NUM_PLAYERS,
    })
    const { playerCredentials } = await lobbyClient.joinMatch(
      GAME_ID,
      matchID,
      {
        playerID: '0',
        playerName,
      }
    )
    writeStorage(matchID, {
      id: '0',
      name: playerName,
      credentials: playerCredentials,
    })
    await firebase.firestore().collection('matches').doc(matchID).set({
      players: [],
    })
    window.location.href = `/${matchID}`
  }

  const handleKeyPress = ({ key }: KeyboardEvent) => {
    if (key === 'Enter') {
      handleCreate()
    }
  }

  return (
    <div className={styles.lobby}>
      <div className="dialog">
        <GameTitle />
        <p>{GAME_DESCRIPTION}</p>
        <div className={styles.inputCombo}>
          <input
            type="text"
            onChange={handleNameChange}
            placeholder="Your name"
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleCreate} disabled={createGameClicked}>
            {createGameClicked ? 'Loading...' : 'Create a Game'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function GameTitle() {
  return (
    <h1>
      <img src={`/${GAME_ID}-logo.png`} alt={GAME_NAME} />
      {GAME_NAME}
    </h1>
  )
}

type MatchLobbyProps = {
  matchID: string
  lobbyClient: LobbyClient
}

function MatchLobby({ matchID, lobbyClient }: MatchLobbyProps) {
  const matchRef = firebase.firestore().doc(`matches/${matchID}`)
  const [match] = useDocumentData<LobbyAPI.Match>(matchRef)
  const [player, setPlayer] = useLocalStorage<Record<string, string>>(matchID, {
    id: '',
    name: '',
    credentials: '',
  })
  const [joinGameClicked, setJoinGameClicked] = useState<boolean>(false)

  function updateMatch() {
    lobbyClient.getMatch(GAME_ID, matchID).then((match) => {
      matchRef.set(match)
    })
  }

  useEffect(updateMatch, [])

  useEffect(() => {
    if (match?.nextMatchID) {
      window.location.href = `/${match.nextMatchID}`
    }
  }, [match])

  if (!match) {
    return null
  }

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    setPlayer({ ...player, name: e.target.value.trim() })
  }

  async function handleJoin() {
    if (!player.name.length) {
      alert('You need to have a name!')
      return
    }
    setJoinGameClicked(true)
    for (const { id, name } of match?.players || []) {
      if (!name) {
        const { playerCredentials } = await lobbyClient.joinMatch(
          GAME_ID,
          matchID,
          {
            playerID: `${id}`,
            playerName: player.name,
          }
        )
        setPlayer({
          ...player,
          id: `${id}`,
          credentials: playerCredentials,
        })
        updateMatch()
        break
      }
    }
  }

  if (match.players.every((player) => player.name)) {
    return (
      <Suspense fallback={null}>
        <Game
          matchID={matchID}
          playerID={player.id}
          credentials={player.credentials}
        />
      </Suspense>
    )
  }

  const handleKeyPress = ({ key }: KeyboardEvent) => {
    if (key === 'Enter') {
      handleJoin()
    }
  }

  return (
    <div className={styles.lobby}>
      <div className="dialog">
        <GameTitle />
        <MatchPlayers players={match.players} />
        <br />
        <CardSkinSwitcher />
        <br />
        {player.credentials.length > 0 ? (
          <>
            <h3>Link to this game:</h3>
            <p>
              <input type="text" value={window.location.href} readOnly />
            </p>
          </>
        ) : (
          <div className={styles.inputCombo}>
            <input
              type="text"
              onChange={handleNameChange}
              value={player.name}
              placeholder="Your name"
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleJoin} disabled={joinGameClicked}>
              {joinGameClicked ? 'Loading...' : 'Join Game'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

type MatchPlayersProps = {
  players: Server.PlayerMetadata[]
}

function MatchPlayers({ players }: MatchPlayersProps) {
  const filledPlayers = players.filter((p) => p.name)

  return (
    <div className={styles.matchPlayers}>
      <h2>
        Players ({filledPlayers.length}/{players.length})
      </h2>
      {filledPlayers.map((player) => (
        <div key={player.id} className={styles.matchPlayer}>
          {player.name}
        </div>
      ))}
    </div>
  )
}

function CardSkinSwitcher() {
  const [currentSkin, setSkin] = useLocalStorage<string>('skin', 'cute')

  return (
    <div className={styles.cardSkinSwitcher}>
      <p>Choose your card skin:</p>
      {['cute', 'classic'].map((skin) => (
        <div
          className={`${styles.cardSkin} ${
            skin === currentSkin ? styles.selectedCardSkin : ''
          }`}
          title={skin}
          onClick={() => {
            writeStorage('skin', skin)
            setSkin(skin)
          }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/assets/cards/${skin}/AS.png`}
            width="100"
            alt={skin}
          />
          {title(skin)}
        </div>
      ))}
      <p className={styles.cardSkinInstructions}>
        Switch skins in-game by right-clicking a card.
      </p>
    </div>
  )
}

const title = (s: string) => s[0].toUpperCase() + s.slice(1)
