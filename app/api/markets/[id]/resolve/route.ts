import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '../../../../lib/db'
import type { BetSide } from '../../../../types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { result, resolvedBy } = await req.json()

  if (result !== 'yes' && result !== 'no') {
    return NextResponse.json({ error: 'result must be yes or no' }, { status: 400 })
  }

  const db = readDB()
  const marketIdx = db.markets.findIndex(m => m.id === id)
  if (marketIdx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const market = db.markets[marketIdx]
  if (market.status === 'resolved') {
    return NextResponse.json({ error: 'Already resolved' }, { status: 400 })
  }

  market.status = 'resolved'
  market.result = result as BetSide
  market.resolvedBy = resolvedBy
  market.resolvedAt = Date.now()

  // Settle all bets for this market
  for (const bet of db.bets) {
    if (bet.marketId !== id || bet.settled) continue
    bet.settled = true
    bet.won = bet.side === result

    const user = db.users.find(u => u.id === bet.userId)
    if (!user) continue

    if (bet.won) {
      user.balance += bet.payout
      user.totalWon += bet.payout
      user.betsWon += 1
      bet.winnings = bet.payout
    } else {
      bet.winnings = 0
    }
  }

  writeDB(db)
  return NextResponse.json(market)
}
