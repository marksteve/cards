import { Server } from 'boardgame.io/server'
import send from 'koa-send'
import serve from 'koa-static'
import { Dos } from './dos/Game'

const server = Server({ games: [Dos] })
const PORT = parseInt(process.env.PORT || '8000', 10)

server.app.use(serve('./build'))
server.app.use(async (ctx, next) => {
  await next()
  if (ctx.response.status === 404) {
    await send(ctx, './build/index.html')
  }
})
server.run(PORT)
