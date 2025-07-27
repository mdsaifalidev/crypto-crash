/**
 * @class ApiError - A class representing an API error.
 * @extends {Error}
 * @param {number} statusCode - The HTTP status code associated with the error.
 * @param {string} [message="Something went wrong"] - A descriptive message for the error.
 * @param {any[]} [errors=[]] - An array containing specific error details.
 * @param {string} [stack=""] - The stack trace for the error. If not provided, it will be captured automatically.
 */
class ApiError extends Error {
  statusCode: number
  data: any
  success: boolean
  errors: any[]

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false
    this.errors = errors

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default ApiError
