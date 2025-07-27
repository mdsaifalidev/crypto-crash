import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import ApiResponse from "../utils/ApiResponse"
import ApiError from "../utils/ApiError"
import GameRound from "../models/gameround.model"

/**
 * Get a game round by id
 * 
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @route GET /rounds/:roundId
 * @returns {Promise<void>} A promise that resolves when the game round is retrieved.
 */
const getGameRoundById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { roundId } = req.params

    const gameRoundRound = await GameRound.findOne({ roundId })
    if (!gameRoundRound) {
      throw new ApiError(404, "Game Round not found")
    }
    res.status(200).json(new ApiResponse(200, gameRoundRound, "Game Round found"))
  }
)

export { getGameRoundById }
