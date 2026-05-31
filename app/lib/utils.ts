export const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  ceremony: { emoji: '💍', label: 'Ceremony' },
  reception: { emoji: '🎉', label: 'Reception' },
  dancing: { emoji: '💃', label: 'Dancing' },
  drama: { emoji: '🍿', label: 'Drama' },
  food: { emoji: '🍰', label: 'Food & Drinks' },
  misc: { emoji: '🎲', label: 'Misc' },
}

export function calcPayout(amount: number, price: number): number {
  if (price <= 0 || price >= 100) return amount
  return Math.round((amount * 100) / price)
}

export function calcProfit(amount: number, price: number): number {
  return calcPayout(amount, price) - amount
}

export function calcMultiplier(price: number): string {
  if (price <= 0 || price >= 100) return '1.00x'
  return (100 / price).toFixed(2) + 'x'
}

export function formatChips(n: number): string {
  return n.toLocaleString()
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
