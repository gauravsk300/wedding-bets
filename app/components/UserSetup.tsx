'use client'

import { useState } from 'react'
import type { User } from '../types'

interface Props {
  onJoin: (user: User) => void
}

export default function UserSetup({ onJoin }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onJoin(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">💍</div>
          <h1 className="text-3xl font-bold text-white mb-1">Wedding Bets</h1>
          <p className="text-gray-400">Pick a name to claim your 1,000 chips</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your name or nickname"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={24}
            autoFocus
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-base"
          />
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
          >
            {loading ? 'Joining...' : "Let's Go →"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Same name = same account. Share the app link with everyone.
        </p>
      </div>
    </div>
  )
}
