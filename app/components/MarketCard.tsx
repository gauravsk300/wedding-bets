'use client'

import { CATEGORY_META, calcMultiplier, formatChips, timeAgo } from '../lib/utils'
import type { Market, BetSide } from '../types'

interface Props {
  market: Market
  onBet: (market: Market, side: BetSide) => void
  onResolve: (market: Market) => void
  currentUserId: string
}

export default function MarketCard({ market, onBet, onResolve, currentUserId }: Props) {
  const meta = CATEGORY_META[market.category]
  const noPrice = 100 - market.yesPrice
  const isResolved = market.status === 'resolved'

  return (
    <div className={`bg-gray-900 border rounded-2xl p-4 transition-all ${isResolved ? 'border-gray-700 opacity-80' : 'border-gray-800 hover:border-gray-700'}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
          {meta.emoji} {meta.label}
        </span>
        <div className="flex items-center gap-2">
          {market.totalVolume > 0 && (
            <span className="text-xs text-gray-500">{formatChips(market.totalVolume)} vol</span>
          )}
          {!isResolved && (
            <button
              onClick={() => onResolve(market)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              title="Resolve market"
            >
              ···
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <p className="text-white font-semibold text-base leading-snug mb-1">{market.title}</p>
      {market.description && (
        <p className="text-gray-500 text-sm mb-3 leading-snug">{market.description}</p>
      )}

      {/* Resolved result */}
      {isResolved && market.result && (
        <div className={`rounded-xl px-4 py-3 mb-3 text-center font-bold text-base ${market.result === 'yes' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-rose-900/40 text-rose-400'}`}>
          Resolved {market.result === 'yes' ? '✓ YES' : '✗ NO'}
        </div>
      )}

      {/* Bet buttons */}
      {!isResolved && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => onBet(market, 'yes')}
            className="bg-emerald-900/40 hover:bg-emerald-500 border border-emerald-800 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-xl px-3 py-3 transition-all group"
          >
            <div className="text-xs font-medium text-emerald-600 group-hover:text-emerald-100 mb-0.5">YES</div>
            <div className="text-lg font-bold">{market.yesPrice}¢</div>
            <div className="text-xs text-emerald-600 group-hover:text-emerald-200">{calcMultiplier(market.yesPrice)} payout</div>
          </button>
          <button
            onClick={() => onBet(market, 'no')}
            className="bg-rose-900/40 hover:bg-rose-500 border border-rose-800 hover:border-rose-500 text-rose-400 hover:text-white rounded-xl px-3 py-3 transition-all group"
          >
            <div className="text-xs font-medium text-rose-600 group-hover:text-rose-100 mb-0.5">NO</div>
            <div className="text-lg font-bold">{noPrice}¢</div>
            <div className="text-xs text-rose-600 group-hover:text-rose-200">{calcMultiplier(noPrice)} payout</div>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        <span className="text-xs text-gray-600">by {market.creator}</span>
        <span className="text-xs text-gray-600">{timeAgo(market.createdAt)}</span>
      </div>
    </div>
  )
}
