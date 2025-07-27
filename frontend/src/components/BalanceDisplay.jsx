const BalanceDisplay = ({ balance }) => {
    console.log("balance", Object.entries(balance?.data?.balances || {}))
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Balances</h3>
      {Object.entries(balance?.data?.balances || {}).map(([currency, amount]) => (
        <p key={currency}>
          {currency}: {amount} (
          {(balance?.data?.usdEquivalents?.[currency] || 0).toFixed(2)} USD)
        </p>
      ))}
    </div>
  )
}

export default BalanceDisplay
