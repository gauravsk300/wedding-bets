import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '../../lib/db'
import { generateId } from '../../lib/utils'
import type { MarketCategory } from '../../types'

export async function GET() {
  const db = await readDB()
  return NextResponse.json(db.markets)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, category, yesPrice, creator } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  if (!creator?.trim()) return NextResponse.json({ error: 'Creator required' }, { status: 400 })
  if (!yesPrice || yesPrice < 1 || yesPrice > 99) {
    return NextResponse.json({ error: 'YES price must be 1–99' }, { status: 400 })
  }

  const market = {
    id: generateId(),
    title: title.trim(),
    description: description?.trim() || undefined,
    creator: creator.trim(),
    createdAt: Date.now(),
    category: (category || 'misc') as MarketCategory,
    yesPrice: Number(yesPrice),
    status: 'open' as const,
    totalBets: 0,
    totalVolume: 0,
  }

  const db = await readDB()
  db.markets.unshift(market)
  await writeDB(db)
  return NextResponse.json(market, { status: 201 })
}
