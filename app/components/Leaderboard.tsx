'use client'

import { formatChips } from '../lib/utils'
import type { User } from '../types'

interface Props {
  users: User[]
  currentUserId: string
}

export default function Leaderboard({ users, currentUserId }: Props) {
  const sorted = [...users].sort((a, b) => {
    const profitA = a.totalWon - a.totalWagered
    const profitB = b.totalWon - b.totalWagered
    return profitB - profitA
  })

  if (users.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600">
        <div className="text-4xl mb-3">🏆</div>
        <p>No players yet. Be the first to join!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-600 px-1 mb-3">Ranked by net profit</div>
      {sorted.map((user, i) => {
        const profit = user.totalWon - user.totalWagered
        const winRate = user.betsPlaced > 0 ? Math.round((user.betsWon / user.betsPlaced) * 100) : 0
        const isMe = user.id === currentUserId

        return (
          <div
            key={user.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              isMe
                ? 'bg-emerald-900/20 border-emerald-800'
                : 'bg-gray-900 border-gray-800'
            }`}
          >
            {/* Rank */}
            <div className="w-7 text-center">
              {i === 0 ? <span className="text-lg">🥇</span>
               : i === 1 ? <span className="text-lg">🥈</span>
               : i === 2 ? <span className="text-lg">🥉</span>
               : <span className="text-sm text-gray-600 font-mono">#{i + 1}</span>}
            </div>

            {/* Name + stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm truncate ${isMe ? 'text-emerald-400' : 'text-white'}`}>
                  {user.name}
                </span>
                {isMe && <span className="text-xs text-emerald-700 shrink-0">you</span>}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {user.betsPlaced} bets · {winRate}% win rate
              </div>
            </div>

            {/* Balance + profit */}
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold text-white">{formatChips(user.balance)}</div>
              <div className={`text-xs font-medium ${profit > 0 ? 'text-emerald-400' : profit < 0 ? 'text-rose-400' : 'text-gray-600'}`}>
                {profit > 0 ? '+' : ''}{formatChips(profit)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
