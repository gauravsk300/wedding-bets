'use client'

import { useState } from 'react'
import { calcPayout, calcProfit, calcMultiplier, formatChips } from '../lib/utils'
import type { Market, BetSide, User } from '../types'

interface Props {
  market: Market
  side: BetSide
  user: User
  onClose: () => void
  onBetPlaced: (updatedUser: User) => void
}

export default function BetModal({ market, side, user, onClose, onBetPlaced }: Props) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = side === 'yes' ? market.yesPrice : 100 - market.yesPrice
  const numAmount = parseInt(amount) || 0
  const payout = calcPayout(numAmount, price)
  const profit = calcProfit(numAmount, price)
  const afterBalance = user.balance - numAmount

  const isValid = numAmount >= 1 && numAmount <= user.balance

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, marketId: market.id, side, amount: numAmount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onBetPlaced(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isYes = side === 'yes'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-4 border-b border-gray-800 ${isYes ? 'bg-emerald-900/20' : 'bg-rose-900/20'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${isYes ? 'text-emerald-400' : 'text-rose-400'}`}>
              Betting {side.toUpperCase()}
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
          </div>
          <p className="text-white font-medium text-sm leading-snug">{market.title}</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Amount input */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Amount (chips)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={user.balance}
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors pr-20"
              />
              <button
                type="button"
                onClick={() => setAmount(String(user.balance))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                MAX
              </button>
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2 mt-2">
              {[50, 100, 250, 500].filter(v => v <= user.balance).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg py-1.5 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Payout breakdown */}
          {numAmount > 0 && (
            <div className="bg-gray-800 rounded-xl p-3.5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Price per share</span>
                <span className="text-white">{price}¢ ({calcMultiplier(price)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Potential payout</span>
                <span className="text-white font-semibold">{formatChips(payout)} chips</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-500">Potential profit</span>
                <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  +{formatChips(profit)} chips
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance after</span>
                <span className={afterBalance < 0 ? 'text-rose-400' : 'text-gray-400'}>
                  {formatChips(afterBalance)} chips
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-rose-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!isValid || loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-colors disabled:bg-gray-700 disabled:text-gray-500 ${
              isYes ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'
            }`}
          >
            {loading ? 'Placing...' : `Place ${side.toUpperCase()} Bet`}
          </button>
        </form>
      </div>
    </div>
  )
}
