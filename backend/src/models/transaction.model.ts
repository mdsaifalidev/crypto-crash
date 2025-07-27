import { Document, Schema, model } from "mongoose"
import { AvailableTransactionTypes } from "../constants"

export interface ITransaction extends Document {
  playerId: Schema.Types.ObjectId
  type: keyof typeof AvailableTransactionTypes
  usdAmount: number
  cryptoAmount: number
  currency: string
  transactionHash?: string
  priceAtTime: number
}

const transactionSchema: Schema<ITransaction> = new Schema(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    type: {
      type: String,
      enum: AvailableTransactionTypes,
      required: true,
    },
    usdAmount: {
      type: Number,
      required: true,
    },
    cryptoAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
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

const Transaction = model<ITransaction>("Transaction", transactionSchema)

export default Transaction
