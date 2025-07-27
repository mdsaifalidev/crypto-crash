const GameStatus = ({ status, multiplier, crashPoint }) => {
    console.log("Game Status: ", status, multiplier, crashPoint)
  let message = ""
  if (status === "betting") message = "Betting Phase"
  else if (status === "active")
    message = `Round Active - Multiplier: ${multiplier || 1}x`
  else if (status === "crashed") message = `Round Crashed at ${crashPoint}x`
  else message = "Waiting for next round"
  return <h2 className="text-2xl font-bold text-center">{message}</h2>
}

export default GameStatus
