import { Client } from 'boardgame.io/client'
import { Card, Play, PusoyDos } from './Game'

class PusoyDosClient {
  client: ReturnType<typeof Client>

  constructor() {
    this.client = Client({
      game: PusoyDos,
      numPlayers: 4,
    })
    this.client.start()
  }
}

const app = new PusoyDosClient()

window['Card'] = Card
window['Play'] = Play

if (module.hot) {
  module.hot.accept()
}
