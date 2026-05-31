'use client'

import { formatChips } from '../lib/utils'
import type { User } from '../types'

type Tab = 'markets' | 'my-bets' | 'leaderboard'

interface Props {
  user: User
  tab: Tab
  onTabChange: (t: Tab) => void
  onCreateMarket: () => void
}

export default function Header({ user, tab, onTabChange, onCreateMarket }: Props) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Top row */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💍</span>
            <span className="font-bold text-white text-lg">Wedding Bets</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500 leading-none">{user.name}</p>
              <p className="text-sm font-semibold text-emerald-400 leading-tight">
                {formatChips(user.balance)} chips
              </p>
            </div>
            <button
              onClick={onCreateMarket}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              + New
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 pb-0">
          {(['markets', 'my-bets', 'leaderboard'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                tab === t
                  ? 'text-white border-emerald-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {t === 'markets' ? 'Markets' : t === 'my-bets' ? 'My Bets' : 'Leaderboard'}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
