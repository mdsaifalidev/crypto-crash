import { Router } from "express"
import { getGameRoundById } from "../controllers/round.controller"

const router = Router()

router.get("/:roundId", getGameRoundById)

export default router
