import connectDB from "../db"
import logger from "../loggers/winston.logger"
import Player from "../models/player.model"
import Wallet from "../models/wallet.model"

/**
 * Seeds the database with initial data.
 *
 * @returns {Promise<void>} A promise that resolves when the seeding is complete.
 */
const seedDatabase = async (): Promise<void> => {
  try {
    await connectDB()

    await Promise.all([Player.deleteMany(), Wallet.deleteMany()])

    const player1 = await Player.create({
      username: "player1",
    })

    await Wallet.insertMany([
      { playerId: player1._id, currency: "BTC", amount: 0.001 },
      { playerId: player1._id, currency: "ETH", amount: 0.1 },
    ])

    const player2 = await Player.create({
      username: "player2",
    })

    await Wallet.insertOne({
      playerId: player2._id,
      currency: "BTC",
      amount: 0.002,
    })

    logger.info("Database seeded successfully")
    process.exit(0)
  } catch (error) {
    logger.error("Database seeding failed", error)
    process.exit(1)
  }
}

seedDatabase()
