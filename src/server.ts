import { Server } from 'boardgame.io/server'
import serve from 'koa-static'
import send from 'koa-send'
import { PusoyDos } from './Game'

const server = Server({ games: [PusoyDos] })
const PORT = parseInt(process.env.PORT || '8000', 10)

server.app.use(serve('./build'))
server.app.use(async (ctx, next) => {
  await next();
  if (ctx.response.status === 404) {
    await send(ctx, './build/index.html')
  }
})
server.run(PORT)
