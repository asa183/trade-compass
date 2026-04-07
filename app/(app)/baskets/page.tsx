'use client'

import { useAppStore } from '@/stores/useAppStore'
import Link from 'next/link'
import { useState } from 'react'
import { TrendingUp, ChevronRight, Shield, Zap, BarChart2 } from 'lucide-react'
import { Basket } from '@/types'
import { getConfidenceColor, getConfidenceColorClass } from '@/lib/ui'

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
              <span style={{ fontSize: 11, fontWeight: 700, color: getConfidenceColor(basket.confidence_score) }}>{basket.confidence_score}%</span>
            </div>
            <div className={`score-bar-track`} style={{ height: 4 }}>
              <div className={`score-bar-fill ${getConfidenceColorClass(basket.confidence_score)}`} style={{ width: `${basket.confidence_score}%` }} />
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
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'core-index', label: 'コア指数' },
    { id: 'sector', label: 'セクター' },
    { id: 'style', label: 'テーマ・スタイル' }, // Assuming 'style' encompasses theme
    { id: 'defensive', label: '防御型' }
  ]

  const filteredBaskets = baskets.filter((b) => {
    const matchesSearch = 
      b.name_ja.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.etfs.some(e => e.ticker.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.background_logic.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || b.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ paddingTop: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          探索・バスケット
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          50以上の投資テーマやインデックスを探索できます
        </p>
      </div>

      {/* 検索 */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 8, 
        background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', 
        borderRadius: 'var(--radius-lg)', padding: '0 12px', height: 44 
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="ティッカー、テーマ名で検索..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', 
            fontSize: 14, outline: 'none'
          }}
        />
        {searchQuery && (
          <button style={{ background: 'none', border: 'none', padding: 4, color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSearchQuery('')}>
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>

      {/* タブ */}
      <div className="horizontal-scroll" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 600, flexShrink: 0,
              background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-elevated)',
              color: activeCategory === cat.id ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${activeCategory === cat.id ? 'var(--accent)' : 'var(--border-strong)'}`,
              transition: 'all 0.2s', cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 今日の推奨 (検索なし、全件表示のときのみ) */}
      {searchQuery === '' && activeCategory === 'all' && basketRecommendations.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="section-header">
            <span className="section-title">✨ 今日の推奨バスケット</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {basketRecommendations.map((rec) => (
              <BasketCard key={rec.basket.id} basket={rec.basket} priority={rec.priority} />
            ))}
          </div>
        </div>
      )}

      {/* バスケット一覧 */}
      <div style={{ marginTop: searchQuery === '' && activeCategory === 'all' && basketRecommendations.length > 0 ? 16 : 0 }}>
        {!(searchQuery === '' && activeCategory === 'all' && basketRecommendations.length > 0) && (
          <div className="section-header">
            <span className="section-title">
              {searchQuery ? '検索結果' : categories.find(c => c.id === activeCategory)?.label}
              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{filteredBaskets.length}件</span>
            </span>
          </div>
        )}
        
        {filteredBaskets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 13 }}>条件に一致するバスケットが見つかりません。</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredBaskets.map((b) => <BasketCard key={b.id} basket={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
