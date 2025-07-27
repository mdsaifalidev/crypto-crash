import "dotenv/config"
import mongoose from "mongoose"
import logger from "../loggers/winston.logger"

/**
 * Establishes a connection to the MongoDB database.
 *
 * @returns {Promise<void>} The promise which resolves when the connection is established.
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    logger.info("MongoDB connected successfully")
  } catch (error) {
    logger.error("MongoDB connection failed", error)
    process.exit(1)
  }
}

export default connectDB
