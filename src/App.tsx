import { Lobby } from 'boardgame.io/react'
import React from 'react'
import PusoyDosBoard from './Board'
import { PusoyDos } from './Game'

const App = () => (
  <Lobby
    gameServer={`http://${window.location.hostname}:8000`}
    lobbyServer={`http://${window.location.hostname}:8000`}
    gameComponents={[{ game: PusoyDos, board: PusoyDosBoard }]}
  />
)

export default App
