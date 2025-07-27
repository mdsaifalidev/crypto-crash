/**
 * @class ApiResponse - A class to standardize API responses.
 *
 * @param {number} statusCode - The HTTP status code.
 * @param {any} data - The response data.
 * @param {string} [message="Success"] - The response message.
 */
class ApiResponse {
  statusCode: number
  data: any
  message: string
  success: boolean

  constructor(statusCode: number, data: any, message: string = "Success") {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}

export default ApiResponse
