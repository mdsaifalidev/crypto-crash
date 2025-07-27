import axios from "axios"
import logger from "../loggers/winston.logger"
import { TransactionType } from "../constants"
import Transaction from "../models/transaction.model"
import crypto from "crypto"
import GameRound from "../models/gameround.model"

let cryptoPricesCache = {}
let lastFetchTime = 0

/**
 * Fetches crypto prices from the specified API URL.
 *
 * @returns {Promise<any>} The fetched crypto prices.
 */
const fetchCryptoPrices = async (): Promise<any> => {
  const now = Date.now()
  if (now - lastFetchTime < 10000) return cryptoPricesCache // Return cached prices if fetched within the last 10 seconds
  try {
    const response = await axios.get(process.env.CRYPTO_PRICE_API_URL!)
    cryptoPricesCache = response.data
    lastFetchTime = now
    logger.info("Fetched crypto prices successfully.", cryptoPricesCache)
    return cryptoPricesCache
  } catch (error) {
    logger.error("Error fetching crypto prices:", error)
    return cryptoPricesCache
  }
}

type TransactionLogParam = {
  playerId: string
  type: keyof typeof TransactionType
  usdAmount: number
  cryptoAmount: number
  currency: string
  priceAtTime: number
}

/**
 * Logs a transaction to the database and logs the transaction details.
 *
 * @param {TransactionLog} transaction - An object containing the transaction details.
 * @param {string} transaction.playerId - The ID of the player involved in the transaction.
 * @param {keyof typeof TransactionType} transaction.type - The type of the transaction.
 * @param {number} transaction.usdAmount - The USD amount of the transaction.
 * @param {number} transaction.cryptoAmount - The cryptocurrency amount of the transaction.
 * @param {string} transaction.currency - The currency used in the transaction.
 * @param {number} transaction.priceAtTime - The price at the time of the transaction.
 * @returns {Promise<void>} A promise that resolves once the transaction is logged.
 */

const logTransaction = async ({
  playerId,
  type,
  usdAmount,
  cryptoAmount,
  currency,
  priceAtTime,
}: TransactionLogParam) => {
  await Transaction.create({
    playerId,
    type,
    usdAmount,
    cryptoAmount,
    currency,
    priceAtTime,
  })
  logger.info(
    `Transaction logged: ${type} - Player: ${playerId}, USD: ${usdAmount}, Crypto: ${cryptoAmount}, Currency: ${currency}, Price: ${priceAtTime}`
  )
}

/**
 * Generates a random server seed for the game round.
 *
 * @returns {string} A random server seed as a hexadecimal string.
 */
const generateServerSeed = (): string => crypto.randomBytes(32).toString("hex")

type CalculateCashPointParams = {
  serverSeed: string
  clientSeed: string
  roundNumber: number
}
/**
 * Calculates the cash out point for a game round based on server and client seeds.
 *
 * @param {Object} params - The parameters for the cash point calculation.
 * @param {string} params.serverSeed - The server seed used for hashing.
 * @param {string} params.clientSeed - The client seed used for hashing.
 * @param {number} params.roundNumber - The round number of the game.
 * @returns {string} The calculated cash point as a fixed decimal string between 1.00 and 120.00.
 */
const calculateCashPoint = ({
  serverSeed,
  clientSeed,
  roundNumber,
}: CalculateCashPointParams): string => {
  const hash = crypto
    .createHash("sha256")
    .update(serverSeed + clientSeed + roundNumber)
    .digest("hex")
  const hashNum = parseInt(hash.substr(0, 8), 16)
  const crashPoint = 1 + (hashNum % 11900) / 100 // 1.00 to 120.00
  return crashPoint.toFixed(2)
}

/**
 * Retrieves the next available round ID for a new game round.
 *
 * @returns {Promise<number>} A promise that resolves to the next round ID.
 */

const getNextRoundId = async () => {
  const lastRound = await GameRound.findOne().sort({ roundId: -1 })
  return lastRound ? lastRound.roundId + 1 : 1
}

export {
  fetchCryptoPrices,
  logTransaction,
  generateServerSeed,
  calculateCashPoint,
  getNextRoundId,
}
