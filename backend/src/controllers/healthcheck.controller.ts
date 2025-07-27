import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import ApiResponse from "../utils/ApiResponse"

/**
 * Health check endpoint to verify the server is running.
 *
 * @async
 * @param {Request} _req - The request object (not used).
 * @param {Response} res - The response object to send the health check status.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
const healthCheck = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(new ApiResponse(200, "OK", "Health check passed"))
  }
)

export { healthCheck }
