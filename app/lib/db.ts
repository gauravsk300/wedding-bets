import fs from 'fs'
import path from 'path'
import type { Market, Bet, User } from '../types'

export interface DB {
  users: User[]
  markets: Market[]
  bets: Bet[]
}

// ── Upstash Redis (production) ──────────────────────────────────────────────

async function redisCmd(...args: unknown[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('no upstash config')
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  })
  const data = await res.json()
  return data.result
}

async function redisRead(): Promise<DB | null> {
  const raw = await redisCmd('GET', 'db') as string | null
  return raw ? JSON.parse(raw) : null
}

async function redisWrite(data: DB): Promise<void> {
  await redisCmd('SET', 'db', JSON.stringify(data))
}

// ── Local file fallback (development) ──────────────────────────────────────

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

function fileRead(): DB | null {
  try {
    if (!fs.existsSync(DB_PATH)) return null
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return null
  }
}

function fileWrite(data: DB): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function readDB(): Promise<DB> {
  const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  try {
    const data = useRedis ? await redisRead() : fileRead()
    return data ?? (await writeDB({ users: [], markets: seedMarkets(), bets: [] }))
  } catch {
    return { users: [], markets: seedMarkets(), bets: [] }
  }
}

export async function writeDB(data: DB): Promise<DB> {
  const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  if (useRedis) {
    await redisWrite(data)
  } else {
    fileWrite(data)
  }
  return data
}

// ── Seed data ───────────────────────────────────────────────────────────────

function seedMarkets(): Market[] {
  const now = Date.now()
  return [
    {
      id: 'seed-1', title: 'The groom cries during the vows',
      description: 'Happy tears count. Ugly cry definitely counts.',
      creator: 'WeddingHost', createdAt: now, category: 'ceremony',
      yesPrice: 72, status: 'open', totalBets: 0, totalVolume: 0,
    },
    {
      id: 'seed-2', title: 'Someone gives a painfully awkward toast',
      description: 'Anything that makes the room go quiet with secondhand embarrassment.',
      creator: 'WeddingHost', createdAt: now, category: 'reception',
      yesPrice: 82, status: 'open', totalBets: 0, totalVolume: 0,
    },
    {
      id: 'seed-3', title: 'The couple leaves the reception before midnight',
      creator: 'WeddingHost', createdAt: now, category: 'reception',
      yesPrice: 55, status: 'open', totalBets: 0, totalVolume: 0,
    },
    {
      id: 'seed-4', title: 'Someone falls on the dance floor',
      description: 'Any fall, stumble-to-the-ground, or dramatic drop counts.',
      creator: 'WeddingHost', createdAt: now, category: 'dancing',
      yesPrice: 38, status: 'open', totalBets: 0, totalVolume: 0,
    },
    {
      id: 'seed-5', title: 'DJ plays a song nobody recognizes',
      description: 'If 3+ people at your table look at each other confused, it counts.',
      creator: 'WeddingHost', createdAt: now, category: 'dancing',
      yesPrice: 65, status: 'open', totalBets: 0, totalVolume: 0,
    },
    {
      id: 'seed-6', title: 'Someone shows up underdressed',
      description: 'Jeans, gym shoes, or cargo shorts at a formal wedding.',
      creator: 'WeddingHost', createdAt: now, category: 'drama',
      yesPrice: 28, status: 'open', totalBets: 0, totalVolume: 0,
    },
    {
      id: 'seed-7', title: 'Photographer makes them redo a pose 3+ times',
      description: '"One more — chin slightly down, eyes up..."',
      creator: 'WeddingHost', createdAt: now, category: 'ceremony',
      yesPrice: 78, status: 'open', totalBets: 0, totalVolume: 0,
    },
    {
      id: 'seed-8', title: 'Someone gets food on their outfit',
      description: 'Any visible stain visible in the photos.',
      creator: 'WeddingHost', createdAt: now, category: 'food',
      yesPrice: 50, status: 'open', totalBets: 0, totalVolume: 0,
    },
  ]
}
