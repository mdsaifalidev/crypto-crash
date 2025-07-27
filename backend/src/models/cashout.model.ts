import { Document, Schema, model } from "mongoose"

export interface ICashOut extends Document {
  playerId: Schema.Types.ObjectId
  roundId: Schema.Types.ObjectId
  multiplier?: number
  cryptoPayout: number
  usdPayout: number
}

const cashOutSchema: Schema<ICashOut> = new Schema(
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
    multiplier: {
      type: Number,
    },
    cryptoPayout: {
      type: Number,
      required: true,
    },
    usdPayout: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const CashOut = model<ICashOut>("CashOut", cashOutSchema)

export default CashOut
