import { Document, Schema, model } from "mongoose"

export interface IWallet extends Document {
  playerId: Schema.Types.ObjectId
  currency: string
  amount: number
}

const walletSchema: Schema<IWallet> = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Wallet = model<IWallet>("Wallet", walletSchema)

export default Wallet
