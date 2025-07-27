import { Server } from "http"
import {
  BETTING_PHASE_DURATION,
  DELAY_AFTER_CRASH,
  GameRoundStatusEnum,
  GROWTH_FACTOR,
  MULTIPLIER_UPDATE_INTERVAL,
} from "../constants"
import GameRound, { IGameRound } from "../models/gameround.model"
import { calculateCashPoint, generateServerSeed, getNextRoundId } from "./helper"

let io: Server | null = null
let currentRound: IGameRound | null = null
let multiplierTimer: NodeJS.Timeout | null = null

/**
 * Starts a new betting phase. Creates a new game round with the next roundId,
 *
 * @returns {Promise<void>}
 */
const startBettingPhase = async (): Promise<void> => {
  const roundId = await getNextRoundId()
  const serverSeed = generateServerSeed()
  const clientSeed = generateServerSeed()
  const cashPoint = calculateCashPoint({
    serverSeed,
    clientSeed,
    roundNumber: roundId,
  })

  currentRound = await GameRound.create({
    roundId,
    startTime: new Date(Date.now() + BETTING_PHASE_DURATION),
    cashPoint,
    serverSeed,
    clientSeed,
    status: GameRoundStatusEnum.BETTING,
  })

  io!.emit("bettingStart", {
    roundId,
    startTime: currentRound.startTime,
  })
  setTimeout(startRoundPhase, BETTING_PHASE_DURATION)
}

/**
 * Starts the multiplier update phase for the current game round.
 *
 * @returns {Promise<void>}
 */
const startRoundPhase = async (): Promise<void> => {
  if (!currentRound) {
    io!.emit("error", {
      message: "No active game round",
    })
    return
  }
  currentRound.status = GameRoundStatusEnum.ACTIVE
  await currentRound.save()

  io!.emit("roundStart", {
    roundId: currentRound.roundId,
  })

  let elapsedTime = 0
  multiplierTimer = setInterval(() => {
    elapsedTime += MULTIPLIER_UPDATE_INTERVAL
    const multiplier = 1 + (elapsedTime / 1000) * GROWTH_FACTOR
    io!.emit("multiplierUpdate", {
      roundId: currentRound?.roundId,
      multiplier: multiplier.toFixed(2),
    })

    if (multiplier > currentRound!.cashPoint) {
      clearInterval(multiplierTimer!)
      currentRound!.status = GameRoundStatusEnum.CRASHED
      currentRound!.save()
      io!.emit("roundCrash", {
        roundId: currentRound?.roundId,
        crashPoint: currentRound?.cashPoint,
      })
      setTimeout(startBettingPhase, DELAY_AFTER_CRASH)
    }
  }, MULTIPLIER_UPDATE_INTERVAL)
}

const startGame = (socketIO: Server) => {
  io = socketIO
  startBettingPhase()
}

export default startGame
