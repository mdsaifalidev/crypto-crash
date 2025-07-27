import { useState } from "react"
import axios from "axios"

const BetForm = ({ status, playerId, onBetPlaced }) => {
  const [usdAmount, setUsdAmount] = useState("")
  const [cryptoCurrency, setCryptoCurrency] = useState("BTC")

  const handleBet = async () => {
    if (status !== "betting" || !usdAmount) return
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/bets`, {
        playerId,
        usdAmount: parseFloat(usdAmount),
        cryptoCurrency,
      })
      setUsdAmount("")
      onBetPlaced()
    } catch (error) {
      console.error("Error placing bet", error)
    }
  }

  return (
    <div className="flex space-x-2 mt-4 justify-center">
      <input
        type="number"
        value={usdAmount}
        onChange={(e) => setUsdAmount(e.target.value)}
        placeholder="USD Amount"
        className="border p-2 rounded"
        disabled={status !== "betting"}
      />
      <select
        value={cryptoCurrency}
        onChange={(e) => setCryptoCurrency(e.target.value)}
        className="border p-2 rounded"
        disabled={status !== "betting"}
      >
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
      </select>
      <button
        onClick={handleBet}
        disabled={status !== "betting"}
        className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
      >
        Place Bet
      </button>
    </div>
  )
}

export default BetForm
