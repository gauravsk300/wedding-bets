'use client'

import { useState } from 'react'
import { formatChips, timeAgo } from '../lib/utils'
import type { Bet } from '../types'

type Filter = 'all' | 'pending' | 'won' | 'lost'

interface Props {
  bets: Bet[]
}

export default function MyBets({ bets }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = bets.filter(b => {
    if (filter === 'pending') return !b.settled
    if (filter === 'won') return b.settled && b.won
    if (filter === 'lost') return b.settled && !b.won
    return true
  }).sort((a, b) => b.placedAt - a.placedAt)

  const totalWagered = bets.reduce((s, b) => s + b.amount, 0)
  const totalWon = bets.filter(b => b.settled && b.won).reduce((s, b) => s + (b.winnings || 0), 0)
  const totalLost = bets.filter(b => b.settled && !b.won).reduce((s, b) => s + b.amount, 0)
  const netProfit = totalWon - (totalWagered - bets.filter(b => !b.settled).reduce((s, b) => s + b.amount, 0))

  if (bets.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <div className="text-4xl mb-3">🎲</div>
        <p>No bets yet. Find a market and place your first bet!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Wagered</div>
          <div className="text-sm font-semibold text-white">{formatChips(totalWagered)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Won</div>
          <div className="text-sm font-semibold text-emerald-400">{formatChips(totalWon)}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Net</div>
          <div className={`text-sm font-semibold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netProfit >= 0 ? '+' : ''}{formatChips(netProfit)}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(['all', 'pending', 'won', 'lost'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bet list */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-600 text-sm py-8">No {filter} bets</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(bet => (
            <div
              key={bet.id}
              className={`bg-gray-900 border rounded-xl px-4 py-3 ${
                bet.settled
                  ? bet.won
                    ? 'border-emerald-800/60'
                    : 'border-rose-800/40 opacity-70'
                  : 'border-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-white text-sm font-medium leading-snug flex-1">{bet.marketTitle}</p>
                <StatusBadge bet={bet} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${bet.side === 'yes' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {bet.side.toUpperCase()} @ {bet.price}¢
                  </span>
                  <span>·</span>
                  <span>{formatChips(bet.amount)} chips</span>
                </div>
                <div className="text-right">
                  {bet.settled && bet.won ? (
                    <span className="text-emerald-400 font-semibold">+{formatChips((bet.winnings || 0) - bet.amount)}</span>
                  ) : bet.settled ? (
                    <span className="text-rose-400">-{formatChips(bet.amount)}</span>
                  ) : (
                    <span className="text-gray-600">→ {formatChips(bet.payout)} if right</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-700 mt-1">{timeAgo(bet.placedAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ bet }: { bet: Bet }) {
  if (!bet.settled) {
    return <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Pending</span>
  }
  if (bet.won) {
    return <span className="text-xs bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full shrink-0">Won ✓</span>
  }
  return <span className="text-xs bg-rose-900/30 text-rose-500 px-2 py-0.5 rounded-full shrink-0">Lost</span>
}
