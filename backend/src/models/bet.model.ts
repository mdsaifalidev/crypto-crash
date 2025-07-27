import { Document, Schema, model } from "mongoose"

export interface IBet extends Document {
  playerId: Schema.Types.ObjectId
  roundId: number
  usdAmount: number
  cryptoCurrency: string
  cryptoAmount: number
  priceAtTime: number
}

const betSchema: Schema<IBet> = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    roundId: {
      type: Number,
      required: true,
      unique: true,
    },
    usdAmount: {
      type: Number,
      required: true,
    },
    cryptoCurrency: {
      type: String,
      required: true,
    },
    cryptoAmount: {
      type: Number,
      required: true,
    },
    priceAtTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Bet = model<IBet>("Bet", betSchema)

export default Bet
