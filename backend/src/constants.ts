const GameRoundStatusEnum = {
  BETTING: "BETTING",
  ACTIVE: "ACTIVE",
  CRASHED: "CRASHED",
} as const

const AvailableGameRoundStatuses: string[] = Object.values(GameRoundStatusEnum)

const TransactionType = {
  BET: "BET",
  CASHOUT: "CASHOUT",
} as const

const AvailableTransactionTypes: string[] = Object.values(TransactionType)

const GROWTH_FACTOR = 1 // Linear growth
const BETTING_PHASE_DURATION = 5000; // 5 seconds
const DELAY_AFTER_CRASH = 2000; // 2 seconds
const MULTIPLIER_UPDATE_INTERVAL = 100; // 100ms

export {
  GameRoundStatusEnum,
  AvailableGameRoundStatuses,
  TransactionType,
  AvailableTransactionTypes,
  GROWTH_FACTOR,
  BETTING_PHASE_DURATION,
  DELAY_AFTER_CRASH,
  MULTIPLIER_UPDATE_INTERVAL
}
