export type MarketCategory = 'ceremony' | 'reception' | 'dancing' | 'drama' | 'food' | 'misc'
export type MarketStatus = 'open' | 'resolved'
export type BetSide = 'yes' | 'no'

export interface Market {
  id: string
  title: string
  description?: string
  creator: string
  createdAt: number
  category: MarketCategory
  yesPrice: number // 1–99: creator-set probability for YES
  status: MarketStatus
  result?: BetSide
  resolvedBy?: string
  resolvedAt?: number
  totalBets: number
  totalVolume: number
}

export interface Bet {
  id: string
  marketId: string
  marketTitle: string
  userId: string
  userName: string
  side: BetSide
  amount: number
  price: number // price at time of bet
  payout: number // potential payout if correct
  placedAt: number
  settled: boolean
  won?: boolean
  winnings?: number
}

export interface User {
  id: string
  name: string
  balance: number
  totalWagered: number
  totalWon: number
  betsPlaced: number
  betsWon: number
}
