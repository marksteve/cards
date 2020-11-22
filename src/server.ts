import { Server } from 'boardgame.io/server'
import { PusoyDos } from './Game'

const server = Server({ games: [PusoyDos] })

server.run(8000)
