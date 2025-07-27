import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import errorHandler from "./middlewares/error.middleware"
import initializeSocketIO from "./socket"
import morganMiddleware from "./loggers/morgan.logger"
import swaggerUi from "swagger-ui-express"
import YAML from "yaml"
import path from "path"
import fs from "fs"
import startGame from "./utils/game"

const file = fs.readFileSync(
  path.resolve(__dirname, "./swagger.yaml"),
  "utf8"
)
const swaggerDocument = YAML.parse(
  file?.replace("- url: ${{server}}", "- url: http://localhost:8080/api/v1")
)

const app = express()

const httpServer = createServer(app)

const io = new Server(httpServer, {
  pingTimeout: 60000, // 60 seconds
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)
app.use(
  express.json({
    limit: "16kb",
  })
)
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(morganMiddleware)

// Routes
import healthCheckRoute from "./routes/healthcheck.route"
import betRoute from "./routes/bet.route"
import balanceRoute from "./routes/balance.route"

app.use("/api/v1/healthcheck", healthCheckRoute)
app.use("/api/v1/bets", betRoute)
app.use("/api/v1/balances", balanceRoute)

// API documentation
app.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "Crypto Crash API docs",
  })
)

// Initialize socket.io
initializeSocketIO(io)

// Start the game
startGame(io as any)

// error handling middleware
app.use(errorHandler)

export default httpServer
