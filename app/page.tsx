'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import MarketCard from './components/MarketCard'
import CreateMarketModal from './components/CreateMarketModal'
import BetModal from './components/BetModal'
import ResolveModal from './components/ResolveModal'
import Leaderboard from './components/Leaderboard'
import MyBets from './components/MyBets'
import UserSetup from './components/UserSetup'
import type { Market, Bet, User, BetSide } from './types'

type Tab = 'markets' | 'my-bets' | 'leaderboard'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [markets, setMarkets] = useState<Market[]>([])
  const [myBets, setMyBets] = useState<Bet[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [tab, setTab] = useState<Tab>('markets')
  const [showCreate, setShowCreate] = useState(false)
  const [betTarget, setBetTarget] = useState<{ market: Market; side: BetSide } | null>(null)
  const [resolveTarget, setResolveTarget] = useState<Market | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wedding-bets-user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('wedding-bets-user')
      }
    }
    setLoading(false)
  }, [])

  const fetchData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) return
    try {
      const [marketsRes, betsRes, usersRes] = await Promise.all([
        fetch('/api/markets'),
        fetch(`/api/bets?userId=${currentUser.id}`),
        fetch('/api/users'),
      ])
      if (marketsRes.ok) setMarkets(await marketsRes.json())
      if (betsRes.ok) setMyBets(await betsRes.json())
      if (usersRes.ok) {
        const allUsers: User[] = await usersRes.json()
        setUsers(allUsers)
        // Keep local user balance in sync
        const fresh = allUsers.find(u => u.id === currentUser.id)
        if (fresh) {
          setUser(fresh)
          localStorage.setItem('wedding-bets-user', JSON.stringify(fresh))
        }
      }
    } catch {
      // silently ignore network errors during polling
    }
  }, [])

  // Initial fetch + poll every 5s
  useEffect(() => {
    if (!user) return
    fetchData(user)
    const interval = setInterval(() => fetchData(user), 5000)
    return () => clearInterval(interval)
  }, [user, fetchData])

  function handleJoin(newUser: User) {
    setUser(newUser)
    localStorage.setItem('wedding-bets-user', JSON.stringify(newUser))
  }

  function handleBetPlaced(updatedUser: User) {
    setUser(updatedUser)
    localStorage.setItem('wedding-bets-user', JSON.stringify(updatedUser))
    setBetTarget(null)
    fetchData(updatedUser)
  }

  function handleMarketCreated(market: Market) {
    setMarkets(prev => [market, ...prev])
    setShowCreate(false)
  }

  function handleMarketResolved(market: Market) {
    setMarkets(prev => prev.map(m => m.id === market.id ? market : m))
    setResolveTarget(null)
    fetchData(user)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) return <UserSetup onJoin={handleJoin} />

  const openMarkets = markets.filter(m => m.status === 'open')
  const resolvedMarkets = markets.filter(m => m.status === 'resolved')

  return (
    <div className="min-h-screen bg-gray-950">
      <Header user={user} tab={tab} onTabChange={setTab} onCreateMarket={() => setShowCreate(true)} />

      <main className="max-w-2xl mx-auto px-4 py-4 pb-16">
        {tab === 'markets' && (
          <div className="space-y-3">
            {markets.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-4xl mb-3">🎲</div>
                <p className="mb-4">No markets yet.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
                >
                  Create the first one
                </button>
              </div>
            ) : (
              <>
                {openMarkets.length > 0 && (
                  <div className="space-y-3">
                    {openMarkets.map(m => (
                      <MarketCard
                        key={m.id}
                        market={m}
                        onBet={(market, side) => setBetTarget({ market, side })}
                        onResolve={setResolveTarget}
                        currentUserId={user.id}
                      />
                    ))}
                  </div>
                )}
                {resolvedMarkets.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600 px-1 pt-2">Resolved</p>
                    {resolvedMarkets.map(m => (
                      <MarketCard
                        key={m.id}
                        market={m}
                        onBet={(market, side) => setBetTarget({ market, side })}
                        onResolve={setResolveTarget}
                        currentUserId={user.id}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'my-bets' && <MyBets bets={myBets} />}

        {tab === 'leaderboard' && <Leaderboard users={users} currentUserId={user.id} />}
      </main>

      {showCreate && (
        <CreateMarketModal
          userName={user.name}
          onClose={() => setShowCreate(false)}
          onCreated={handleMarketCreated}
        />
      )}

      {betTarget && (
        <BetModal
          market={betTarget.market}
          side={betTarget.side}
          user={user}
          onClose={() => setBetTarget(null)}
          onBetPlaced={handleBetPlaced}
        />
      )}

      {resolveTarget && (
        <ResolveModal
          market={resolveTarget}
          resolverName={user.name}
          onClose={() => setResolveTarget(null)}
          onResolved={handleMarketResolved}
        />
      )}
    </div>
  )
}
