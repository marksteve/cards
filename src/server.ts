import { Server } from 'boardgame.io/server'
import serve from 'koa-static'
import { PusoyDos } from './Game'

const server = Server({ games: [PusoyDos] })
const PORT = parseInt(process.env.PORT || '8000', 10)

server.app.use(serve('./build'))
server.run(PORT)
