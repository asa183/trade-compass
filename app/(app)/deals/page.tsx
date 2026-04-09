'use client'

import { useAppStore } from '@/stores/useAppStore'
import Link from 'next/link'
import { AlertTriangle, ChevronRight, Zap, Shield, TrendingUp, Clock } from 'lucide-react'
import { Deal } from '@/types'
import { LivePriceBadge } from '@/components/ui/LivePriceBadge'
import { useEffect } from 'react'

const RISK_LABEL: Record<string, string> = { low: '低', medium: '中', high: '高', 'very-high': '最高' }
const RISK_COLOR: Record<string, string> = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', 'very-high': '#e05757' }
const REC_LEVEL_COLORS: Record<string, string> = { S: '#FFD700', A: 'var(--accent)', B: 'var(--success)', C: 'var(--text-muted)' }
const SIZE_CONFIG = {
  skip: { label: '見送り推奨', color: 'var(--danger)', bg: 'var(--danger-dim)' },
  paper: { label: '模擬推奨', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  small: { label: '小さめ推奨', color: 'var(--warning)', bg: 'var(--warning-dim)' },
  standard: { label: '標準実行可', color: 'var(--success)', bg: 'var(--success-dim)' },
}

function DealCard({ deal }: { deal: Deal }) {
  const fit = deal.execution_fit
  const fitConf = fit ? SIZE_CONFIG[fit.size_recommendation] : SIZE_CONFIG.paper
  const riskColor = RISK_COLOR[deal.risk_level]
  const recColor = deal.recommendation_level ? REC_LEVEL_COLORS[deal.recommendation_level] || 'var(--text-muted)' : 'var(--text-muted)'

  return (
    <Link href={`/deals/${deal.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-interactive" style={{ position: 'relative' }}>
        
        {deal.recommendation_level && (
          <div style={{ position: 'absolute', top: -10, right: 10, background: recColor, color: '#000', fontWeight: 900, padding: '4px 12px', borderRadius: 12, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            Rank {deal.recommendation_level}
          </div>
        )}

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, marginTop: deal.recommendation_level ? 6 : 0 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {deal.name_ja}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {deal.target_etfs.map((e) => (
                <div key={e.ticker} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="badge badge-accent">{e.ticker}</span>
                  <LivePriceBadge symbol={e.ticker} />
                </div>
              ))}
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${riskColor}1a`, color: riskColor, fontWeight: 600 }}>
                リスク{RISK_LABEL[deal.risk_level]}
              </span>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        </div>

        {/* 推奨テキスト */}
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
          {deal.recommended_action}
        </p>

        {/* 根拠 */}
        {deal.recommendation_rationale && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: 6, marginBottom: 10, lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)' }}>選定理由:</strong> {deal.recommendation_rationale}
          </div>
        )}

        {/* ロジックライン */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          <div style={{ background: 'var(--success-dim)', borderRadius: 8, padding: '6px 8px' }}>
            <div style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, marginBottom: 2 }}>利確目標</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{deal.take_profit_line}</div>
          </div>
          <div style={{ background: 'var(--danger-dim)', borderRadius: 8, padding: '6px 8px' }}>
            <div style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700, marginBottom: 2 }}>損切りライン</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{deal.stop_loss_line}</div>
          </div>
        </div>

        {/* イベント注意 */}
        {deal.event_caution_note && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '6px 8px', background: 'var(--warning-dim)', borderRadius: 8, marginBottom: 8 }}>
            <AlertTriangle size={11} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 11, color: 'var(--warning)', lineHeight: 1.4 }}>{deal.event_caution_note}</span>
          </div>
        )}

        {/* 実行適合 */}
        {fit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ color: 'var(--text-muted)' }}>市場適合</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{fit.market_fit_score}</span>
              </div>
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ color: 'var(--text-muted)' }}>あなた適合</span>
                <span style={{ fontWeight: 700, color: fit.user_fit_score >= 60 ? 'var(--success)' : 'var(--warning)' }}>
                  {fit.user_fit_score}
                </span>
              </div>
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              background: fitConf.bg, color: fitConf.color,
              fontSize: 11, fontWeight: 700,
            }}>
              {fitConf.label}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function DealsPage() {
  const { deals, fetchLiveQuotes } = useAppStore()
  const activeDeals = deals.filter((d) => d.status === 'active')

  useEffect(() => {
    if (activeDeals.length > 0) {
      const symbols = Array.from(new Set(activeDeals.flatMap(d => d.target_etfs.map(e => e.ticker))))
      fetchLiveQuotes(symbols)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deals.length, fetchLiveQuotes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ paddingTop: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          ディールカード
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          市場レジームとあなたの特性を掛け合わせた候補です
        </p>
      </div>

      {/* 実行適合の説明 */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10 }}>
        <Zap size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>実行適合判定について</div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            市場条件だけでなく、あなたの過去の傾向・現在のコンディションをもとに、今あなたに合う判断を表示しています。
          </p>
        </div>
      </div>

      {/* アクティブなディール */}
      <div>
        <div className="section-header">
          <span className="section-title">現在のディール</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeDeals.length}件</span>
        </div>
        {activeDeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Shield size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div>現在アクティブなディールはありません</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>市場条件が整い次第、新しいディールが追加されます</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeDeals.map((d) => <DealCard key={d.id} deal={d} />)}
          </div>
        )}
      </div>

      {/* 見送りも価値がある */}
      <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <TrendingUp size={16} color="var(--neutral)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neutral)', marginBottom: 4 }}>見送りも立派な判断です</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              条件がそろわない時に待つことは、感情的な損失を防ぐ最も効果的な行動のひとつです。
              見送りの記録も、あなたの成長データになります。
            </p>
          </div>
        </div>
      </div>

      {/* 免責 */}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, paddingBottom: 8 }}>
        これは投資判断の支援情報です。将来の成果を保証しません。実行可否はご自身でご判断ください。
      </p>
    </div>
  )
}
