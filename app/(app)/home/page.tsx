'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  ChevronRight,
  Zap,
  TrendingUp,
  BookOpen,
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { RegimeLabel } from '@/types'

const REGIME_CONFIG: Record<RegimeLabel, { color: string; bg: string; icon: string }> = {
  'risk-on': { color: 'var(--success)', bg: 'var(--success-dim)', icon: '🚀' },
  'risk-off': { color: 'var(--danger)', bg: 'var(--danger-dim)', icon: '🛡️' },
  'rate-decline-tailwind': { color: 'var(--accent)', bg: 'var(--accent-dim)', icon: '📉' },
  'rate-rise-headwind': { color: 'var(--warning)', bg: 'var(--warning-dim)', icon: '📈' },
  'slowdown-caution': { color: 'var(--warning)', bg: 'var(--warning-dim)', icon: '⚠️' },
  'overheat-caution': { color: 'var(--warning)', bg: 'var(--warning-dim)', icon: '🌡️' },
  'rebound-early': { color: 'var(--success)', bg: 'var(--success-dim)', icon: '↗️' },
  'trend-continue': { color: 'var(--accent)', bg: 'var(--accent-dim)', icon: '📊' },
  'high-vol-caution': { color: 'var(--danger)', bg: 'var(--danger-dim)', icon: '⚡' },
}

const RISK_LABEL: Record<string, string> = {
  low: '低', medium: '中', high: '高', 'very-high': '最高',
}

const SIZE_CONFIG = {
  skip: { label: '見送り推奨', color: 'var(--danger)', bg: 'var(--danger-dim)' },
  paper: { label: '模擬推奨', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  small: { label: '小さめ推奨', color: 'var(--warning)', bg: 'var(--warning-dim)' },
  standard: { label: '標準実行可', color: 'var(--success)', bg: 'var(--success-dim)' },
}

export default function HomePage() {
  const {
    user,
    isOnboarded,
    marketRegime,
    marketEvents,
    deals,
    pendingReviews,
    notifications,
    basketRecommendations,
    baskets,
    fetchMarketData,
    isLoading,
    profile,
    dataFreshness,
  } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (!isOnboarded) { router.push('/onboarding'); return }
    fetchMarketData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const regime = marketRegime
  const regConf = REGIME_CONFIG[regime.label] ?? REGIME_CONFIG['trend-continue']
  const activeDeals = deals.filter((d) => d.status === 'active').slice(0, 2)
  const upcomingEvent = marketEvents.filter((e) => !e.is_completed)[0]
  const displayBaskets = basketRecommendations.length > 0
    ? basketRecommendations.slice(0, 3).map(r => r.basket)
    : baskets.slice(0, 3)
  const unreadCount = notifications.filter((n) => !n.is_read).length

  const updatedAt = format(new Date(regime.calculated_at), 'M/d HH:mm', { locale: ja })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ===== ヘッダー: データ鮮度 (Glassmorphism) ===== */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            width: 8, height: 8, borderRadius: '50%', 
            background: dataFreshness.label === 'fresh' ? 'var(--success)' : 'var(--warning)',
            boxShadow: `0 0 8px ${dataFreshness.label === 'fresh' ? 'var(--success)' : 'var(--warning)'}`
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {dataFreshness.label === 'fresh' ? '市場データ同期完了' : 'データ更新中...'}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} />
          {format(new Date(dataFreshness.last_updated_at), 'M/d HH:mm', { locale: ja })} 更新
        </div>
      </div>

      {/* ===== 市場レジームカード ===== */}
      <Link href="/market" style={{ textDecoration: 'none' }}>
        <div className="glass-panel" style={{
          background: `linear-gradient(135deg, ${regConf.bg}, rgba(26, 32, 53, 0.4))`,
          border: `1px solid ${regConf.color}33`,
          padding: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                今日の市場レジーム
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{regConf.icon}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: regConf.color }}>
                  {regime.label_ja}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 11 }}>
              <Clock size={11} />
              <span>{updatedAt}</span>
            </div>
          </div>

          {/* スコアバー群 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 14 }}>
            {[
              { label: '追い風', score: regime.score_tailwind, color: 'var(--success)' },
              { label: 'リスク', score: regime.score_risk, color: regime.score_risk > 60 ? 'var(--danger)' : 'var(--accent)' },
              { label: '過熱感', score: regime.score_heat, color: regime.score_heat > 65 ? 'var(--warning)' : 'var(--accent)' },
              { label: 'トレンド', score: regime.score_trend, color: 'var(--accent)' },
            ].map(({ label, score, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}</span>
                </div>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* サマリーテキスト */}
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
            {regime.summary_text}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: regConf.color, fontSize: 12, fontWeight: 500 }}>
            <span>詳細を見る</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </Link>

      {/* ===== 今夜の重要イベント ===== */}
      {upcomingEvent && (
        <div className="glass-panel" style={{
          background: 'linear-gradient(135deg, var(--warning-dim), rgba(232, 167, 43, 0.05))',
          border: '1px solid rgba(232,167,43,0.25)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', marginBottom: 2 }}>
              {upcomingEvent.importance === 'high' ? '本日の重要イベント' : '今後のイベント'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
              {upcomingEvent.label}
            </div>
            {upcomingEvent.note && (
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.5 }}>
                {upcomingEvent.note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== 今日の推奨行動 ===== */}
      {activeDeals.length > 0 && activeDeals[0].execution_fit && (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            今日の推奨行動
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 10 }}>
            {activeDeals[0].recommended_action}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: SIZE_CONFIG[activeDeals[0].execution_fit.size_recommendation].bg,
            fontSize: 12,
            fontWeight: 700,
            color: SIZE_CONFIG[activeDeals[0].execution_fit.size_recommendation].color,
          }}>
            <Zap size={11} />
            {SIZE_CONFIG[activeDeals[0].execution_fit.size_recommendation].label}
          </div>
        </div>
      )}

      {/* ===== 注目バスケット ===== */}
      <div>
        <div className="section-header">
          <span className="section-title">注目バスケット</span>
          <Link href="/baskets" className="section-link">すべて見る</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayBaskets.map((basket) => (
            <Link key={basket.id} href={`/baskets/${basket.id}`} style={{ textDecoration: 'none' }}>
              <div className="card-interactive" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: basket.category === 'core-index' ? 'var(--accent-dim)'
                    : basket.category === 'sector' ? 'rgba(74,186,135,0.12)'
                    : basket.category === 'defensive' ? 'var(--warning-dim)'
                    : 'var(--neutral-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <TrendingUp size={18} color={
                    basket.category === 'core-index' ? 'var(--accent)'
                    : basket.category === 'sector' ? 'var(--success)'
                    : basket.category === 'defensive' ? 'var(--warning)'
                    : 'var(--neutral)'
                  } />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {basket.name_ja}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                      {basket.etfs[0]?.ticker}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }} className="truncate">
                    {basket.tailwind_factors[0] ?? basket.background_logic}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                    {basket.confidence_score}%
                  </span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== 新着ディール ===== */}
      <div>
        <div className="section-header">
          <span className="section-title">新着ディール</span>
          <Link href="/deals" className="section-link">すべて見る</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeDeals.map((deal) => {
            const fit = deal.execution_fit
            const fitConf = fit ? SIZE_CONFIG[fit.size_recommendation] : SIZE_CONFIG.paper
            return (
              <Link key={deal.id} href={`/deals/${deal.id}`} style={{ textDecoration: 'none' }}>
                <div className="card-interactive">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {deal.name_ja}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {deal.target_etfs.map((e) => (
                          <span key={e.ticker} className="badge badge-accent">{e.ticker}</span>
                        ))}
                        <span className={`badge badge-${deal.risk_level === 'low' ? 'success' : deal.risk_level === 'high' ? 'danger' : 'warning'}`}>
                          リスク{RISK_LABEL[deal.risk_level]}
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 'var(--radius-full)',
                        background: fitConf.bg, color: fitConf.color,
                        fontSize: 11, fontWeight: 700,
                        border: `1px solid ${fitConf.color}33`,
                      }}>
                        {fitConf.label}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                    {deal.recommended_action}
                  </p>
                  {deal.event_caution_note && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '6px 8px', background: 'var(--warning-dim)', borderRadius: 8 }}>
                      <AlertTriangle size={12} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11, color: 'var(--warning)', lineHeight: 1.4 }}>
                        {deal.event_caution_note}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      詳細を見る <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ===== 振り返り未完了 ===== */}
      {pendingReviews.length > 0 && (
        <Link href="/reviews" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--accent-dim)',
            border: '1px solid rgba(91,138,244,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} color="var(--accent)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                  振り返りが{pendingReviews.length}件あります
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                  20秒のライトレビューで完了できます
                </div>
              </div>
            </div>
            <ArrowRight size={16} color="var(--accent)" />
          </div>
        </Link>
      )}

      {/* ===== データ更新ボタン ===== */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
        <button
          onClick={fetchMarketData}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--radius-full)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          {isLoading ? '更新中…' : 'データ更新'}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
