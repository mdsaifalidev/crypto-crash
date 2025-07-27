import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import logger from "../loggers/winston.logger"
import ApiError from "../utils/ApiError"

/**
 * Middleware to handle errors in the application.
 *
 * @param {Error} err - The error object thrown by the application.
 * @param {Object} _req - The request object (not used).
 * @param {Object} res - The response object used to send the error response.
 * @param {Function} _next - The next middleware function (not used).
 * @returns {Response} - Returns a JSON response with the error details.
 */
const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500
    const message = error.message || "Something went wrong"
    error = new ApiError(statusCode, message, error?.errors || [], error?.stack)
  }

  const response = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  }

  logger.error(error.message)

  res.status(error.statusCode).json(response)
}

export default errorHandler
