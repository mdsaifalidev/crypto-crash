import { Document, Schema, model } from "mongoose"

export interface IPlayer extends Document {
  username: string
}

const playerSchema: Schema<IPlayer> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const Player = model<IPlayer>("Player", playerSchema)

export default Player
