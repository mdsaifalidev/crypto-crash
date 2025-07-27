import { Router } from "express"
import { getBalancesByPlayerId } from "../controllers/balance.controller"

const router = Router()

router.get("/:playerId", getBalancesByPlayerId)

export default router
