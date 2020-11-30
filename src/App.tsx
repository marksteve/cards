import { Lobby } from 'boardgame.io/react'
import React from 'react'
import PusoyDosBoard from './Board'
import { PusoyDos } from './Game'

const App = () => (
  <>
    <h1>DOS</h1>
    <Lobby
      gameServer={process.env.REACT_APP_GAME_SERVER}
      lobbyServer={process.env.REACT_APP_LOBBY_SERVER}
      gameComponents={[{ game: PusoyDos, board: PusoyDosBoard }]}
    />
  </>
)

export default App
