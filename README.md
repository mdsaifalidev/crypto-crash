Crypto Crash Game Backend
This project is the backend implementation of an online "Crash" game called "Crypto Crash." It handles game logic, simulated cryptocurrency transactions with real-time price integration, and real-time multiplayer updates using WebSockets.

Table of Contents

Setup Instructions
Prerequisites
Installation


API Endpoints
Place a Bet
Check Player Balance


WebSocket Events
Server Emits
Client Sends


Provably Fair Crash Algorithm
USD-to-Crypto Conversion Logic
Approach Overview
Game Logic
Crypto Integration
WebSockets




Setup Instructions
Prerequisites

Node.js (v14 or higher)
MongoDB (running locally or accessible via a connection string)
A free API key from a cryptocurrency API provider (e.g., CoinGecko, CoinMarketCap)

Installation

Clone the repository:
git clone https://github.com/mdsaifalidev/crypto-crash.git
cd crypto-crash


Install dependencies:
npm install


Set up environment variables:

Create a .env file in the root directory with the following content:
NODE_ENV=development
PORT=8080
MONGODB_URI=
CRYPTO_PRICE_API_URL=https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd
CORS_ORIGIN=http://localhost:5173


Run the application:
npm run dev




API Endpoints
Place a Bet

URL: /api/bet
Method: POST
Request Body:{
  "playerId": "string",
  "usdAmount": "number",
  "cryptoCurrency": "string" // e.g., "BTC", "ETH"
}


Response:{
  "message": "Bet placed successfully"
}



Check Player Balance

URL: /api/balance/:playerId
Method: GET
Response:{
  "balances": {
    "BTC": "number",
    "ETH": "number"
  },
  "usdEquivalents": {
    "BTC": "number",
    "ETH": "number"
  }
}




WebSocket Events
Server Emits

bettingStart

Payload:{
  "roundId": "string",
  "startTime": "ISO date string"
}


Description: Notifies clients that the betting phase for a new round has started.


roundStart

Payload:{
  "roundId": "string"
}


Description: Notifies clients that the round has started and the multiplier is now active.


multiplierUpdate

Payload:{
  "roundId": "string",
  "multiplier": "number"
}


Description: Updates the current multiplier value in real-time.


playerCashout

Payload:{
  "playerId": "string",
  "roundId": "string",
  "multiplier": "number",
  "cryptoPayout": "number",
  "usdPayout": "number"
}


Description: Notifies all clients when a player cashes out, including the payout details.


roundCrash

Payload:{
  "roundId": "string",
  "crashPoint": "number"
}


Description: Notifies clients that the round has crashed at the specified crash point.



Client Sends

cashout
Payload:{
  "playerId": "string",
  "roundId": "string"
}


Description: Sent by the client to request a cashout during an active round.




Provably Fair Crash Algorithm
The crash point for each round is determined using a provably fair algorithm to ensure fairness and transparency. Here's how it works:

Seed Generation:

A server seed is generated randomly for each round using a cryptographically secure method.
A client seed is provided (in this implementation, it's fixed for simplicity, but in a production environment, it would be unique per player or round).


Crash Point Calculation:

The crash point is calculated by hashing the combination of the server seed, client seed, and round number using SHA-256.
The formula used is:crash_point = hash(server_seed + client_seed + round_number) % max_crash


The result is scaled to a value between 1.00 and 120.00 to determine the crash multiplier.


Verification:

After the round ends, the server seed is revealed.
Players can verify the fairness by recalculating the crash point using the revealed server seed, client seed, and round number.
This ensures that neither the server nor the players can manipulate or predict the outcome in advance.



This method guarantees a fair and transparent gaming experience, as the crash point is determined before the round starts and can be independently verified.

USD-to-Crypto Conversion Logic
Real-Time Price Fetching

The application fetches real-time cryptocurrency prices from a public API (e.g., CoinGecko, CoinMarketCap).
To avoid hitting API rate limits, prices are cached for 10 seconds. If a request is made within this window, the cached price is used.

Conversion Calculation

When a player places a bet in USD, the equivalent amount in the chosen cryptocurrency is calculated using the current market price.
Formula for betting:crypto_amount = usd_amount / crypto_price


When a player cashes out, the crypto payout is converted back to USD for display purposes using the latest available price.
Formula for cashout display:usd_payout = crypto_payout * crypto_price



This ensures that all conversions are accurate and reflect real-time market rates at the time of the transaction.

Approach Overview
Game Logic

The game operates in rounds, each consisting of a betting phase (where players place bets) and an active phase (where the multiplier increases until it crashes).
During the betting phase, players bet in USD, which is converted to the chosen cryptocurrency.
In the active phase, the multiplier increases exponentially over time. Players can cash out at any point before the crash to win their bet multiplied by the current multiplier.
If a player does not cash out before the crash, they lose their bet.

Crypto Integration

A simulated wallet system manages player balances in different cryptocurrencies (e.g., BTC, ETH).
Bets are deducted from the player's crypto balance, and cashouts are added back to it.
All transactions (bets and cashouts) are logged with mock transaction hashes to simulate blockchain interactions.
Real-time cryptocurrency prices are fetched and used for all USD-to-crypto conversions.

WebSockets

WebSockets are used to provide real-time updates to all connected clients, ensuring a seamless multiplayer experience.
The server broadcasts events such as round starts, multiplier updates, player cashouts, and round crashes.
Clients can send cashout requests via WebSocket during active rounds, which are processed in real-time.

This approach ensures that the game is fair, responsive, and capable of handling multiple players simultaneously with real-time updates.
