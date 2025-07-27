import { Server, Socket } from "socket.io"
import GameRound from "../models/gameround.model"
import logger from "../loggers/winston.logger"
import {
  GameRoundStatusEnum,
  GROWTH_FACTOR,
  TransactionType,
} from "../constants"
import Bet from "../models/bet.model"
import CashOut from "../models/cashout.model"
import { fetchCryptoPrices, logTransaction } from "../utils/helper"

/**
 * Handles a cash out request from a player.
 *
 * @param {Socket} socket - The socket instance for the player who is cashing out.
 * @param {object} data - The data object with the player ID and round ID.
 * @param {Server} io - The server instance for broadcasting the cash out event.
 *
 * @throws {Error} An error occurred while processing cash out.
 */
const handleCashOut = async (
  socket: Socket,
  data: { playerId: string; roundId: number },
  io: Server
): Promise<void> => {
  try {
    const { playerId, roundId } = data

    const gameRound = await GameRound.findOne({roundId})
    logger.info(`GameRound: ${gameRound}`)
    if (!gameRound || gameRound.status !== GameRoundStatusEnum.ACTIVE) {
      socket.emit("error", {
        message: "Game round is not active or does not exist.",
      })
      return
    }

    const bet = await Bet.findOne({
      playerId,
      roundId,
    })
    logger.info(`Bet: ${bet}`)
    if (!bet) {
      socket.emit("error", {
        message: "Bet not found for the player in this round.",
      })
      return
    }

    const existingCashOut = await CashOut.findOne({
      playerId,
      roundId,
    })
    logger.info(`Existing CashOut: ${existingCashOut}`)
    if (existingCashOut) {
      socket.emit("error", {
        message: "Cashout already exists for this player in this round.",
      })
      return
    }

    const elapsedTime: number =
      (new Date().getTime() - new Date(gameRound.startTime).getTime()) / 1000 // Calculate elapsed time in seconds
    const multiplier = 1 + elapsedTime * GROWTH_FACTOR // Calculate the multiplier based on elapsed time and growth factor
    if (multiplier >= gameRound.cashPoint) {
      socket.emit("error", {
        message: "Game round has crashed, cannot cash out.",
      })
      return
    }
    const cryptoPayout = bet.cryptoAmount * multiplier // Calculate the payout based on the bet amount and multiplier
    const price = (await fetchCryptoPrices())[
      bet.cryptoCurrency.toLowerCase() === "btc" ? "bitcoin" : "ethereum"
    ].usd
    const usdPayout = cryptoPayout * price // Calculate the payout in USD

    await Promise.all([
      CashOut.create({
        playerId,
        roundId,
        multiplayer: multiplier.toFixed(2), // Format the multiplier to 2 decimal places
        cryptoPayout,
        usdPayout,
      }),

      logTransaction({
        playerId,
        type: TransactionType.CASHOUT,
        usdAmount: usdPayout,
        cryptoAmount: cryptoPayout,
        currency: bet.cryptoCurrency,
        priceAtTime: price,
      }),
    ])

    io.emit("playerCashOut", {
      playerId,
      roundId,
      multiplier: multiplier.toFixed(2),
      cryptoPayout,
      usdPayout,
    })
  } catch (error) {
    logger.error("Error handling cash out:", error)
    socket.emit("error", {
      message: "An error occurred while processing cash out.",
    })
  }
}

/**
 * Initializes the socket.io server by listening for connections
 * and disconnections.
 *
 * @param {Server} io - The socket.io server instance.
 */
const initializeSocketIO = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected")
    socket.on("cashOut", (data) => {
      handleCashOut(socket, data, io)
    })
    socket.on("disconnect", () => {
      console.log("A user disconnected")
    })
  })
}

export default initializeSocketIO
