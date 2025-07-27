import React from "react"

const CashOutButton = ({
  status,
  playerCashedOut,
  playerId,
  roundId,
  socket,
}) => {
  console.log("Round Id: ", roundId)
  const handleCashOut = () => {
    if (status === "active" && !playerCashedOut) {
      socket.emit("cashOut", { playerId, roundId })
    }
  }

  return (
    <button
      onClick={handleCashOut}
      disabled={status !== "active" || playerCashedOut}
      className="mt-4 bg-green-500 text-white p-2 rounded disabled:bg-gray-400 block mx-auto"
    >
      Cash Out
    </button>
  )
}

export default CashOutButton
