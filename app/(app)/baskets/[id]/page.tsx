'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { getConfidenceColor, getConfidenceColorClass } from '@/lib/ui'
import { calculateDynamicBasketScore } from '@/lib/scoring'
import { ScoreBreakdown } from '@/components/ui/ScoreBreakdown'

export default function BasketDetailPage() {
  const { id } = useParams()
  const { baskets, marketRegime } = useAppStore()
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  const basket = baskets.find((b) => b.id === id)

  if (!basket) return (
    <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--text-muted)' }}>
      バスケットが見つかりません
    </div>
  )

  const riskColor = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', 'very-high': '#e05757' }[basket.risk_level]
  const riskLabel = { low: '低リスク', medium: '中リスク', high: '高リスク', 'very-high': '非常に高い' }[basket.risk_level]

  const scoreDetails = calculateDynamicBasketScore(basket, marketRegime)
  const totalScore = scoreDetails.total

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ paddingTop: 8 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, marginBottom: 12, padding: 0 }}>
          <ArrowLeft size={16} /> 戻る
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>
            {basket.strategy_name_ja}
          </span>
          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${riskColor}1a`, color: riskColor, fontWeight: 600 }}>
            {riskLabel}
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          {basket.name_ja}
        </h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {basket.etfs.map((e) => (
            <span key={e.ticker} className="badge badge-accent">{e.ticker}</span>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>総合確信度</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: getConfidenceColor(totalScore) }}>{totalScore}%</span>
        </div>
        <div className="score-bar-track" style={{ height: 8 }}>
          <div className={`score-bar-fill ${getConfidenceColorClass(totalScore)}`} style={{ width: `${totalScore}%` }} />
        </div>
        
        {/* Score Breakdown Bars */}
        <ScoreBreakdown scoreDetails={scoreDetails} />

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          {totalScore >= 75 ? '確信度が高い局面です' : totalScore >= 60 ? '条件はそろいつつあります' : '不確実性が高め。慎重に。'}
        </p>
      </div>

      {/* Background Logic */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          背景・ロジック
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>
          {basket.background_logic}
        </p>
      </div>

      {/* 追い風 / 逆風 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(74,186,135,0.2)', borderRadius: 'var(--radius-md)', padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>追い風</div>
          {basket.tailwind_factors.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(208,90,90,0.2)', borderRadius: 'var(--radius-md)', padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>逆風</div>
          {basket.headwind_factors.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <AlertTriangle size={12} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 対象ETF詳細 */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          対象ETF
        </div>
        {basket.etfs.map((etf) => (
          <div key={etf.ticker} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{etf.ticker}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{etf.name}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{etf.description}</p>
          </div>
        ))}
      </div>

      {/* 保有期間 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <Clock size={16} color="var(--accent)" />
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>想定保有期間</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{basket.hold_period_days}</div>
        </div>
      </div>

      {/* 詳細（展開式） */}
      <div className="card">
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            エントリー・利確・損切り条件
          </span>
          {showDetails ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </button>

        {showDetails && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'エントリー条件', value: basket.entry_condition, icon: TrendingUp, color: 'var(--accent)' },
              { label: '利確ライン', value: basket.exit_take_profit, icon: CheckCircle, color: 'var(--success)' },
              { label: '損切りライン', value: basket.exit_stop_loss, icon: XCircle, color: 'var(--danger)' },
              { label: '見送り条件', value: basket.skip_condition, icon: AlertTriangle, color: 'var(--warning)' },
              { label: '前提崩れ条件', value: basket.invalidation_condition, icon: XCircle, color: 'var(--danger)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: `1px solid ${color}22` }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <Icon size={12} color={color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 類似局面コメント */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>📚 類似過去局面</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {basket.similar_period_comment}
        </p>
      </div>

      {/* ディール候補へ */}
      <Link href="/deals" style={{ textDecoration: 'none' }}>
        <div className="btn btn-primary btn-full" style={{ justifyContent: 'center' }}>
          このバスケットのディールを見る
        </div>
      </Link>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingBottom: 8, lineHeight: 1.6 }}>
        これは投資判断の支援情報です。将来の成果を保証するものではありません。<br />
        投資の最終判断はご自身の責任で行ってください。
      </div>
    </div>
  )
}
