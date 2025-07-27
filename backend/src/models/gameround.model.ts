import { Document, Schema, model } from "mongoose"
import { AvailableGameRoundStatuses, GameRoundStatusEnum } from "../constants"

export interface IGameRound extends Document {
  roundId: number
  startTime: Date
  cashPoint: number
  serverSeed: string
  clientSeed: string
  status: keyof typeof GameRoundStatusEnum
}

const gameRoundSchema: Schema<IGameRound> = new Schema(
  {
    roundId: {
      type: Number,
      required: true,
      unique: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    cashPoint: {
      type: Number,
      required: true,
    },
    serverSeed: {
      type: String,
      required: true,
    },
    clientSeed: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: AvailableGameRoundStatuses,
      default: GameRoundStatusEnum.BETTING,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const GameRound = model<IGameRound>("GameRound", gameRoundSchema)

export default GameRound
