import { PaperTrade } from '@/types'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PaperTradeCardProps {
  trade: PaperTrade
  liveQuotes: Record<string, { price: number; changePct: number }>
  actionButton?: React.ReactNode
}

export function PaperTradeCard({ trade, liveQuotes, actionButton }: PaperTradeCardProps) {
  const t = trade
  const targetTicker = t.deal.target_etfs[0]?.ticker
  const quote = targetTicker ? liveQuotes[targetTicker] : undefined
  const currentPrice = quote?.price
  const diffPct = currentPrice ? ((currentPrice - t.entry_price) / t.entry_price) * 100 : undefined
  const isUp = diffPct !== undefined && diffPct >= 0

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {t.deal.name_ja}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {t.deal.target_etfs.map((e) => (
              <span key={e.ticker} className="badge badge-accent">{e.ticker}</span>
            ))}
          </div>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 11, fontWeight: 700 }}>
          進行中
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
        <div>仮想投資額: <strong>¥{t.virtual_amount.toLocaleString()}</strong></div>
        <div>開始日: <strong>{format(new Date(t.entry_date), 'M/d', { locale: ja })}</strong></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> 実行時（エントリー）価格
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
            ${t.entry_price.toFixed(2)}
          </div>
        </div>
        
        <div style={{ background: 'var(--bg-elevated)', border: `1px solid ${currentPrice ? (isUp ? 'rgba(74,186,135,0.4)' : 'rgba(208,90,90,0.4)') : 'var(--border-strong)'}`, borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>現在の価格</span>
            {diffPct !== undefined && (
              <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isUp ? '+' : ''}{diffPct.toFixed(2)}%
              </span>
            )}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: currentPrice ? (isUp ? 'var(--success)' : 'var(--danger)') : 'var(--text-primary)' }}>
            {currentPrice ? `$${currentPrice.toFixed(2)}` : '取得中...'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 11 }}>
        <div style={{ background: 'var(--success-dim)', borderRadius: 8, padding: '6px 8px' }}>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>利確目標</span>
          <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{t.deal.take_profit_line}</div>
        </div>
        <div style={{ background: 'var(--danger-dim)', borderRadius: 8, padding: '6px 8px' }}>
          <span style={{ color: 'var(--danger)', fontWeight: 700 }}>損切りライン</span>
          <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{t.deal.stop_loss_line}</div>
        </div>
      </div>

      {actionButton}
    </div>
  )
}
