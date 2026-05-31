import { NextRequest, NextResponse } from 'next/server'
import { readDB, writeDB } from '../../lib/db'
import { generateId } from '../../lib/utils'

export async function GET() {
  const db = await readDB()
  return NextResponse.json(db.users)
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const db = await readDB()
  const existing = db.users.find(u => u.name.toLowerCase() === name.trim().toLowerCase())
  if (existing) return NextResponse.json(existing)

  const user = {
    id: generateId(),
    name: name.trim(),
    balance: 1000,
    totalWagered: 0,
    totalWon: 0,
    betsPlaced: 0,
    betsWon: 0,
  }
  db.users.push(user)
  await writeDB(db)
  return NextResponse.json(user, { status: 201 })
}
