'use client'

import { useAppStore } from '@/stores/useAppStore'
import Link from 'next/link'
import { TrendingUp, ChevronRight, Shield, Zap, BarChart2 } from 'lucide-react'
import { Basket } from '@/types'

const CATEGORY_CONFIG = {
  'core-index': { label: 'コア指数型', color: 'var(--accent)', bg: 'var(--accent-dim)', icon: BarChart2 },
  'style': { label: 'スタイル型', color: 'var(--success)', bg: 'var(--success-dim)', icon: TrendingUp },
  'sector': { label: 'セクター型', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: Zap },
  'defensive': { label: '防御型', color: 'var(--warning)', bg: 'var(--warning-dim)', icon: Shield },
}

const RISK_COLOR = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', 'very-high': '#e05757' }
const RISK_LABEL = { low: '低', medium: '中', high: '高', 'very-high': '最高' }

function BasketCard({ basket, priority }: { basket: Basket; priority?: number }) {
  const conf = CATEGORY_CONFIG[basket.category]
  const Icon = conf.icon
  return (
    <Link href={`/baskets/${basket.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-interactive">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: conf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={conf.color} />
            </div>
            <div>
              {priority && (
                <div style={{ fontSize: 10, color: conf.color, fontWeight: 700, marginBottom: 2 }}>
                  #{priority} 優先
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {basket.name_ja}
              </div>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>

        {/* ETF Tickers */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {basket.etfs.map((e) => (
            <span key={e.ticker} className="badge badge-accent" style={{ fontSize: 11 }}>{e.ticker}</span>
          ))}
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: conf.bg, color: conf.color, fontWeight: 600 }}>
            {conf.label}
          </span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${RISK_COLOR[basket.risk_level]}18`, color: RISK_COLOR[basket.risk_level], fontWeight: 600 }}>
            リスク{RISK_LABEL[basket.risk_level]}
          </span>
        </div>

        {/* Background */}
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
          {basket.background_logic}
        </p>

        {/* Tailwind / Headwind */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'var(--success-dim)', borderRadius: 8, padding: '6px 8px' }}>
            <div style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, marginBottom: 3 }}>追い風</div>
            {basket.tailwind_factors.slice(0, 2).map((f, i) => (
              <div key={i} style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {f}</div>
            ))}
          </div>
          <div style={{ background: 'var(--danger-dim)', borderRadius: 8, padding: '6px 8px' }}>
            <div style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700, marginBottom: 3 }}>逆風</div>
            {basket.headwind_factors.slice(0, 2).map((f, i) => (
              <div key={i} style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.5 }}>• {f}</div>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>確信度</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{basket.confidence_score}%</span>
            </div>
            <div className="score-bar-track" style={{ height: 4 }}>
              <div className="score-bar-fill accent" style={{ width: `${basket.confidence_score}%` }} />
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {basket.hold_period_days}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function BasketsPage() {
  const { baskets, basketRecommendations } = useAppStore()

  const categories = ['core-index', 'sector', 'style', 'defensive'] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', paddingTop: 8 }}>
        候補バスケット
      </h1>

      {/* 今日の推奨バスケット */}
      {basketRecommendations.length > 0 && (
        <div>
          <div className="section-header">
            <span className="section-title">今日の推奨バスケット</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {basketRecommendations.map((rec) => (
              <BasketCard key={rec.basket.id} basket={rec.basket} priority={rec.priority} />
            ))}
          </div>
        </div>
      )}

      {/* カテゴリ別 */}
      {categories.map((cat) => {
        const catBaskets = baskets.filter((b) => b.category === cat)
        if (catBaskets.length === 0) return null
        const conf = CATEGORY_CONFIG[cat]
        return (
          <div key={cat}>
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="section-title">{conf.label}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catBaskets.map((b) => <BasketCard key={b.id} basket={b} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
