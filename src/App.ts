import { Client } from 'boardgame.io/react'
import PusoyDosBoard from './Board'
import { PusoyDos } from './Game'

const App = Client({
  game: PusoyDos,
  board: PusoyDosBoard,
  numPlayers: 4,
})

export default App