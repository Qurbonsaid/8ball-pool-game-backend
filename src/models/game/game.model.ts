import {Schema, model} from 'mongoose'

import {CollectionNames} from '../../constants/db.constants'
import {GameStatus} from '../../constants/status.constant'

export const gameSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: GameStatus.STARTED,
      enum: GameStatus,
    },
    winner: String,
    player1: {
      type: String,
      required: true,
    },
    player1Name: String,
    player2: String,
    player2Name: String,
  },
  {timestamps: true, versionKey: false},
)

export const GameModel = model(CollectionNames.GAME, gameSchema)
