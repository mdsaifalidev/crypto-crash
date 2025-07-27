import React, { useState, useEffect, useReducer } from "react"
import io from "socket.io-client"
import axios from "axios"
import GameStatus from "./components/GameStatus"
import BetForm from "./components/BetForm"
import CashOutButton from "./components/CashOutButton"
import BalanceDisplay from "./components/BalanceDisplay"

const socket = io(import.meta.env.VITE_API_URL)

const initialState = {
  status: "waiting",
  roundId: null,
  multiplier: 1.0,
  crashPoint: null,
  playerCashedOut: false,
  message: null,
}

const reducer = (state, action) => {
  let crashMessage
  switch (action.type) {
    case "BETTING_START":
      return {
        ...state,
        status: "betting",
        roundId: action.roundId,
        playerCashedOut: false,
        message: null,
      }
    case "ROUND_START":
      return { ...state, status: "active", multiplier: 1.0, message: null }
    case "MULTIPLIER_UPDATE":
      return { ...state, multiplier: action.multiplier }
    case "PLAYER_CASHED_OUT":
      return {
        ...state,
        playerCashedOut: true,
        message: `Cashed out at ${action.multiplier}x`,
      }
    case "ROUND_CRASHED":
      crashMessage = state.playerCashedOut
        ? null
        : "Round crashed! You lost your bet."
      return {
        ...state,
        status: "crashed",
        crashPoint: action.crashPoint,
        message: crashMessage,
      }
    case "SET_ERROR":
      return { ...state, message: action.error }
    case "CLEAR_MESSAGE":
      return { ...state, message: null }
    default:
      return state
  }
}

function App() {
  const [playerId, setPlayerId] = useState("")
  const [tempPlayerId, setTempPlayerId] = useState("")
  const [balance, setBalance] = useState({ balances: {}, usdEquivalents: {} })
  const [gameState, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    socket.on("bettingStart", (data) =>
      dispatch({ type: "BETTING_START", roundId: data.roundId })
    )
    socket.on("roundStart", () => dispatch({ type: "ROUND_START" }))
    socket.on("multiplierUpdate", (data) =>
      dispatch({ type: "MULTIPLIER_UPDATE", multiplier: data.multiplier })
    )
    socket.on("playerCashOut", (data) => {
      if (data.playerId === playerId) {
        dispatch({ type: "PLAYER_CASHED_OUT", multiplier: data.multiplier })
        fetchBalance()
      }
    })
    socket.on("roundCrash", (data) =>
      dispatch({ type: "ROUND_CRASHED", crashPoint: data.crashPoint })
    )
    socket.on("error", (data) =>
      dispatch({ type: "SET_ERROR", error: data.message })
    )

    return () => {
      socket.off("bettingStart")
      socket.off("roundStart")
      socket.off("multiplierUpdate")
      socket.off("playerCashOut")
      socket.off("roundCrash")
      socket.off("error")
    }
  }, [playerId])

  useEffect(() => {
    if (gameState.message) {
      const timer = setTimeout(() => dispatch({ type: "CLEAR_MESSAGE" }), 3000)
      return () => clearTimeout(timer)
    }
  }, [gameState.message])

  const fetchBalance = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/balances/${playerId}`
      )
      console.log(`response: ${JSON.stringify(response.data)}`)
      setBalance(response.data)
    } catch (error) {
      console.error("Error fetching balance", error)
    }
  }

  useEffect(() => {
    if (playerId) fetchBalance()
  }, [playerId])

  if (!playerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Enter Player ID</h2>
          <input
            type="text"
            value={tempPlayerId}
            onChange={(e) => setTempPlayerId(e.target.value)}
            className="border p-2 rounded w-full mb-4"
            placeholder="Your Player ID"
          />
          <button
            onClick={() => setPlayerId(tempPlayerId)}
            className="bg-blue-500 text-white p-2 rounded w-full"
          >
            Set Player ID
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Crypto Crash Game
        </h1>
        {gameState.message && (
          <p className="text-red-500 text-center mb-4">{gameState.message}</p>
        )}
        <BalanceDisplay balance={balance} />
        <GameStatus
          status={gameState.status}
          multiplier={gameState.multiplier}
          crashPoint={gameState.crashPoint}
        />
        <BetForm
          status={gameState.status}
          playerId={playerId}
          onBetPlaced={fetchBalance}
        />
        <CashOutButton
          status={gameState.status}
          playerCashedOut={gameState.playerCashedOut}
          playerId={playerId}
          roundId={gameState.roundId}
          socket={socket}
        />
      </div>
    </div>
  )
}

export default App
