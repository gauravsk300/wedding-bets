'use client'

import { useState } from 'react'
import { CATEGORY_META } from '../lib/utils'
import type { Market, MarketCategory } from '../types'

interface Props {
  userName: string
  onClose: () => void
  onCreated: (market: Market) => void
}

export default function CreateMarketModal({ userName, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<MarketCategory>('misc')
  const [yesPrice, setYesPrice] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, yesPrice, creator: userName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onCreated(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const noPrice = 100 - yesPrice

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-bold text-base">Create a Market</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Question *</label>
            <input
              type="text"
              placeholder="e.g. The groom cries during the vows"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Details (optional)</label>
            <textarea
              placeholder="Clarify what counts..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={240}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(CATEGORY_META) as [MarketCategory, typeof CATEGORY_META[string]][]).map(([key, m]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`text-xs py-2 px-1 rounded-xl border transition-colors ${
                    category === key
                      ? 'bg-emerald-900/40 border-emerald-600 text-emerald-400'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* YES Price slider */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Set the line — how likely is YES?
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-emerald-900/30 border border-emerald-800 rounded-xl p-3 text-center">
                <div className="text-xs text-emerald-600 mb-1">YES</div>
                <div className="text-xl font-bold text-emerald-400">{yesPrice}%</div>
                <div className="text-xs text-emerald-700">{yesPrice}¢/share</div>
              </div>
              <div className="bg-rose-900/30 border border-rose-800 rounded-xl p-3 text-center">
                <div className="text-xs text-rose-600 mb-1">NO</div>
                <div className="text-xl font-bold text-rose-400">{noPrice}%</div>
                <div className="text-xs text-rose-700">{noPrice}¢/share</div>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="99"
              value={yesPrice}
              onChange={e => setYesPrice(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Very unlikely</span>
              <span>50/50</span>
              <span>Very likely</span>
            </div>
          </div>

          {error && <p className="text-rose-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? 'Creating...' : 'Create Market'}
          </button>
        </form>
      </div>
    </div>
  )
}
