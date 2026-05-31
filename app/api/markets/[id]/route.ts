import { NextRequest, NextResponse } from 'next/server'
import { readDB } from '../../../lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = readDB()
  const market = db.markets.find(m => m.id === id)
  if (!market) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(market)
}
