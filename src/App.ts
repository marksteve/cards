import { Client } from 'boardgame.io/client';
import { TicTacToe } from './Game';

class TicTacToeClient {
  client: ReturnType<typeof Client>;

  constructor() {
    this.client = Client({ game: TicTacToe });
    this.client.start();
  }
}

const app = new TicTacToeClient();