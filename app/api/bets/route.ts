import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '../../lib/db'
import { calcPayout, generateId } from '../../lib/utils'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const marketId = req.nextUrl.searchParams.get('marketId')
  const db = readDB()
  let bets = db.bets
  if (userId) bets = bets.filter(b => b.userId === userId)
  if (marketId) bets = bets.filter(b => b.marketId === marketId)
  return NextResponse.json(bets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, marketId, side, amount } = body

  if (!userId || !marketId || !side || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (amount < 1) return NextResponse.json({ error: 'Minimum bet is 1 chip' }, { status: 400 })
  if (side !== 'yes' && side !== 'no') {
    return NextResponse.json({ error: 'Side must be yes or no' }, { status: 400 })
  }

  const db = readDB()
  const user = db.users.find(u => u.id === userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const market = db.markets.find(m => m.id === marketId)
  if (!market) return NextResponse.json({ error: 'Market not found' }, { status: 404 })
  if (market.status !== 'open') return NextResponse.json({ error: 'Market is closed' }, { status: 400 })

  if (user.balance < amount) {
    return NextResponse.json({ error: 'Insufficient chips' }, { status: 400 })
  }

  const price = side === 'yes' ? market.yesPrice : 100 - market.yesPrice
  const payout = calcPayout(amount, price)

  const bet = {
    id: generateId(),
    marketId,
    marketTitle: market.title,
    userId,
    userName: user.name,
    side,
    amount,
    price,
    payout,
    placedAt: Date.now(),
    settled: false,
  }

  user.balance -= amount
  user.totalWagered += amount
  user.betsPlaced += 1

  market.totalBets += 1
  market.totalVolume += amount

  db.bets.push(bet)
  writeDB(db)
  return NextResponse.json({ bet, user }, { status: 201 })
}
