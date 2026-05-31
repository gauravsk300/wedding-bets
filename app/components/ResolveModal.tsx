'use client'

import { useState } from 'react'
import type { Market, BetSide } from '../types'

interface Props {
  market: Market
  resolverName: string
  onClose: () => void
  onResolved: (market: Market) => void
}

export default function ResolveModal({ market, resolverName, onClose, onResolved }: Props) {
  const [result, setResult] = useState<BetSide | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleResolve() {
    if (!result) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/markets/${market.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, resolvedBy: resolverName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onResolved(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Resolve Market</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-gray-400 text-sm leading-snug">{market.title}</p>

          <div>
            <p className="text-xs text-gray-500 mb-2">What happened?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResult('yes')}
                className={`py-4 rounded-xl font-bold text-base border transition-all ${
                  result === 'yes'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-emerald-900/20 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
                }`}
              >
                ✓ YES
              </button>
              <button
                onClick={() => setResult('no')}
                className={`py-4 rounded-xl font-bold text-base border transition-all ${
                  result === 'no'
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-rose-900/20 border-rose-800 text-rose-400 hover:bg-rose-900/40'
                }`}
              >
                ✗ NO
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-gray-800 rounded-xl p-3 text-sm text-gray-400">
              All bets on <strong className={result === 'yes' ? 'text-emerald-400' : 'text-rose-400'}>{result.toUpperCase()}</strong> will be paid out. Losing bets are forfeit.
            </div>
          )}

          {error && <p className="text-rose-400 text-sm">{error}</p>}

          <button
            onClick={handleResolve}
            disabled={!result || loading}
            className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? 'Resolving...' : 'Confirm Resolution'}
          </button>
        </div>
      </div>
    </div>
  )
}
