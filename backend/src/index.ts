import "dotenv/config"
import httpServer from "./app"
import connectDB from "./db"
import logger from "./loggers/winston.logger"

;(async () => {
  try {
    await connectDB()
    httpServer.listen(process.env.PORT, () => {
      logger.info(
        `Visit the documentation at: http://localhost:${process.env.PORT}`
      )
      logger.info(`Server is running on port ${process.env.PORT}`)
    })
  } catch (error) {
    logger.error("Failed to connect to the database", error)
    process.exit(1)
  }
})()
