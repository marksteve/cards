import { BoardProps } from 'boardgame.io/react'
import React from 'react'

export default function PusoyDosBoard(props: BoardProps) {
  return <div>{JSON.stringify(props)}</div>
}
