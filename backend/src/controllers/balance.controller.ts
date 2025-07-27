import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import { fetchCryptoPrices } from "../utils/helper"
import Wallet, { IWallet } from "../models/wallet.model"

/**
 * Get the balance of a player
 *
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @route GET /balances/:playerId
 * @returns {Promise<void>} A promise that resolves when the balance is retrieved.
 */
const getBalancesByPlayerId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { playerId } = req.params
    const wallets: IWallet[] = await Wallet.find({ playerId })
    if (!wallets) {
      throw new ApiError(404, "Wallet not found")
    }

    const balances: Record<string, number> = {}
    wallets.forEach((wallet) => {
      balances[wallet.currency] = wallet.amount
    })

    console.log(balances)

    const prices = await fetchCryptoPrices()
    console.log("prices", prices)
    const usdEquivalents: Record<string, number> = {}
    const currencyMap = {
      BTC: "bitcoin",
      ETH: "ethereum",
    }
    for (const currency in balances) {
      const apiCurrency = currencyMap[currency as keyof typeof currencyMap]
      const price = prices[apiCurrency]?.usd
      if (price) {
        usdEquivalents[currency] = balances[currency] * price
      }
    }

    res.status(200).json(new ApiResponse(200, { balances, usdEquivalents }))
  }
)

export { getBalancesByPlayerId }
