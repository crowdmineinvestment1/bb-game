# Bb.GAME — Full-Stack Crypto Casino Web Application

Welcome to **Bb.GAME**, a feature-complete clone of BC.GAME built with Next.js 14, TypeScript, Tailwind CSS, and Supabase (PostgreSQL + Realtime).

## Features

- **Lobby / Lobby Feed**: Real-time ticker and bet feed showing wins and losses across the platform.
- **6 BC Originals**: Play Crash, Dice, Plinko, Mines, Limbo, and Wheel.
- **Provably Fair RNG**: Every bet outcome is verified using HMAC-SHA256 based on client seed + server seed + nonce.
- **Multi-Coin Wallet**: Full sandbox deposits and withdrawals for BTC, ETH, USDT, BNB, SOL, and DOGE.
- **Global Chat Sidebar**: Live chat with online player counter and message history.
- **Admin Panel**: Adjust user balances, toggle maintenance mode, manage users, and approve transactions.
- **Promotions & Leaderboard**: Claim Daily Login bonuses, Welcome Bonuses, and compete in the Daily/Weekly/Monthly races.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand
- **Backend**: Next.js App Router API Routes
- **Database & Realtime**: Supabase (PostgreSQL + Realtime channels)
- **Auth**: JWT credentials auth & Ethereum wallet connect signature

---

## Supabase Database Setup

To run this application, you must create the required tables in your Supabase project. Go to your **Supabase Dashboard → SQL Editor** and execute the following SQL commands:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  wallet_address TEXT UNIQUE,
  avatar_url TEXT,
  vip_level INT DEFAULT 0,
  xp INT DEFAULT 0,
  kyc_status TEXT DEFAULT 'none',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL DEFAULT 'BTC',
  balance DECIMAL(20,8) DEFAULT 0,
  deposit_address TEXT,
  UNIQUE(user_id, coin)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdraw'
  status TEXT DEFAULT 'completed',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  coin TEXT NOT NULL DEFAULT 'BTC',
  multiplier DECIMAL(10,4),
  payout DECIMAL(20,8) DEFAULT 0,
  server_seed TEXT,
  client_seed TEXT,
  nonce INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  vip_level INT DEFAULT 0,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'message',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Enable Realtime Channels

Ensure that you enable **Realtime** on the following tables in the Supabase Dashboard:
1. `chat_messages`
2. `bets`

---

## Local Installation

1. Navigate to the project directory:
   ```bash
   cd bb-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Provably Fair Verification Logic

The game outcomes are determined by hashing the server and client seeds with a nonce:
```typescript
const hash = hmacSHA256(serverSeed, `${clientSeed}:${nonce}`);
```

You can verify any game result using the built-in **Provably Fair Verification Modal** inside the lobby or games, which calculates the exact roll, path, mine placement, or multiplier locally in your browser.
