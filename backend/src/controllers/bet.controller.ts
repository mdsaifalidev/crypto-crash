import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import Bet from "../models/bet.model"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import GameRound from "../models/gameround.model"
import { GameRoundStatusEnum, TransactionType } from "../constants"
import { fetchCryptoPrices, logTransaction } from "../utils/helper"
import Wallet from "../models/wallet.model"
import mongoose from "mongoose"

/**
 * place a new bet
 *
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @route POST /bets
 * @returns {Promise<void>} A promise that resolves when the bet is created.
 */
const placeBet = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { playerId, usdAmount, cryptoCurrency } = req.body
    const session = await mongoose.startSession()
    await session.startTransaction()
    try {
      const currentRound = await GameRound.findOne({
        status: GameRoundStatusEnum.BETTING,
      }).session(session)

      if (!currentRound) {
        throw new ApiError(400, "No active betting phase")
      }

      const prices = await fetchCryptoPrices()
      const price =
        prices[cryptoCurrency.toLowerCase() === "btc" ? "bitcoin" : "ethereum"]
          .usd
      if (!price) {
        throw new ApiError(400, "Invalid crypto currency")
      }

      const cryptoAmount = usdAmount / price
      const balance = await Wallet.findOne({
        playerId: new mongoose.Types.ObjectId(playerId),
        currency: cryptoCurrency,
      }).session(session)
      console.log("balance", balance)

      if (!balance || balance.amount < cryptoAmount) {
        throw new ApiError(400, "Insufficient balance")
      }

      await Wallet.updateOne(
        { playerId, currency: cryptoCurrency },
        { $inc: { amount: -cryptoAmount } }
      ).session(session)

      await Bet.create(
        [
          {
            playerId,
            roundId: currentRound.roundId,
            usdAmount,
            cryptoCurrency,
            cryptoAmount,
            priceAtTime: price,
          },
        ],
        { session }
      )

      await logTransaction({
        playerId,
        type: TransactionType.BET,
        usdAmount,
        cryptoAmount,
        currency: cryptoCurrency,
        priceAtTime: price,
      })

      await session.commitTransaction()

      res.status(201).json(new ApiResponse(201, "Bet placed successfully"))
    } catch (error) {
      await session.abortTransaction()
      next(error)
    } finally {
      await session.endSession()
    }
  }
)

export { placeBet }
