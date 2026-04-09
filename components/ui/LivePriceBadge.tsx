'use client'

import { useAppStore } from '@/stores/useAppStore'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

export function LivePriceBadge({ symbol }: { symbol: string }) {
  const { liveQuotes } = useAppStore()
  const quote = liveQuotes[symbol]
  
  if (!quote) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: 11, color: 'var(--text-muted)' }}>
      <RefreshCw size={10} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <span>...</span>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const isUp = quote.changePct >= 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-elevated)', border: `1px solid ${isUp ? 'rgba(74,186,135,0.3)' : 'rgba(208,90,90,0.3)'}`, borderRadius: 'var(--radius-full)', padding: '3px 8px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
      <span style={{ color: 'var(--text-primary)' }}>${quote.price.toFixed(2)}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: isUp ? 'var(--success)' : 'var(--danger)' }}>
        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {isUp ? '+' : ''}{quote.changePct.toFixed(2)}%
      </span>
    </div>
  )
}
