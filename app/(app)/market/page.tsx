'use client'

import { useAppStore } from '@/stores/useAppStore'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, Wind, AlertTriangle, ChevronRight, Info,
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

function IndexCard({ ticker, value, change }: { ticker: string; value: number; change: number }) {
  const isUp = change >= 0
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 12px',
      minWidth: 120,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{ticker}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value.toLocaleString()}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3, marginTop: 2,
        fontSize: 12, fontWeight: 600,
        color: isUp ? 'var(--success)' : 'var(--danger)',
      }}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isUp ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
  )
}

export default function MarketPage() {
  const { marketSnapshot: snap, marketRegime: regime, marketEvents } = useAppStore()

  const updatedAt = format(new Date(regime.calculated_at), 'M月d日 HH:mm', { locale: ja })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ paddingTop: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          今日の市場
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          <Info size={11} />
          <span>最終更新: {updatedAt}（米国市場引け後）</span>
        </div>
      </div>

      {/* === 主要指数 === */}
      <div>
        <div className="section-header">
          <span className="section-title">主要指数</span>
        </div>
        <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          <IndexCard ticker="S&P500" value={snap.sp500} change={snap.sp500_change_pct} />
          <IndexCard ticker="Nasdaq100" value={snap.nasdaq100} change={snap.nasdaq100_change_pct} />
          <IndexCard ticker="Russell2000" value={snap.russell2000} change={snap.russell2000_change_pct} />
        </div>
      </div>

      {/* === 市場レジーム詳細 === */}
      <div className="card">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          市場レジーム詳細
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', marginBottom: 12 }}>
          {regime.label_ja}
        </div>

        {/* Scores */}
        {[
          { label: '追い風スコア', val: regime.score_tailwind, color: 'var(--success)' },
          { label: 'リスクスコア', val: regime.score_risk, color: regime.score_risk > 60 ? 'var(--danger)' : 'var(--accent)' },
          { label: '過熱感スコア', val: regime.score_heat, color: regime.score_heat > 65 ? 'var(--warning)' : 'var(--accent)' },
          { label: 'トレンドスコア', val: regime.score_trend, color: 'var(--accent)' },
          { label: 'タイミング', val: regime.score_timing, color: regime.score_timing > 60 ? 'var(--success)' : 'var(--warning)' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}/100</span>
            </div>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${val}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>

      {/* === 追い風 / 逆風 === */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(74,186,135,0.2)', borderRadius: 'var(--radius-md)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Wind size={14} color="var(--success)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>追い風</span>
          </div>
          {regime.tailwind_factors.map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 4 }}>
              • {f}
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(208,90,90,0.2)', borderRadius: 'var(--radius-md)', padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color="var(--danger)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)' }}>逆風・注意</span>
          </div>
          {regime.headwind_factors.map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 4 }}>
              • {f}
            </div>
          ))}
        </div>
      </div>

      {/* === 注目ポイント === */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
          今週の注目ポイント
        </div>
        {regime.watch_points.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>

      {/* === マクロ指標 === */}
      <div>
        <div className="section-header">
          <span className="section-title">マクロ指標</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'VIX', value: snap.vix.toFixed(1), note: snap.vix < 18 ? 'リスク低め' : snap.vix < 25 ? '通常' : '高ボラ警戒', color: snap.vix < 18 ? 'var(--success)' : snap.vix < 25 ? 'var(--text-secondary)' : 'var(--danger)' },
            { label: '米10年債', value: `${snap.us10y_yield.toFixed(2)}%`, note: snap.us10y_yield < 4.0 ? '成長株追い風' : '高水準に注意', color: snap.us10y_yield < 4.0 ? 'var(--success)' : 'var(--warning)' },
            { label: 'ドル指数', value: snap.dxy.toFixed(1), note: '米ドル強度', color: 'var(--text-secondary)' },
            { label: '原油', value: `$${snap.crude_oil.toFixed(1)}`, note: 'エネルギー価格', color: 'var(--text-secondary)' },
            { label: '200MA上比率', value: `${snap.above_200ma_ratio}%`, note: snap.above_200ma_ratio > 60 ? '市場内部健全' : '弱まりに注意', color: snap.above_200ma_ratio > 60 ? 'var(--success)' : 'var(--warning)' },
            { label: '52週高値更新', value: `${snap.new_52w_high_count}件`, note: '強さの指標', color: snap.new_52w_high_count > 150 ? 'var(--success)' : 'var(--text-secondary)' },
          ].map(({ label, value, note, color }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* === セクター強度 === */}
      <div>
        <div className="section-header">
          <span className="section-title">セクター強度</span>
        </div>
        <div className="card">
          {Object.entries(snap.sector_strength)
            .sort((a, b) => b[1] - a[1])
            .map(([sector, score]) => {
              const names: Record<string, string> = {
                technology: 'テクノロジー', semiconductors: '半導体', financials: '金融',
                energy: 'エネルギー', healthcare: 'ヘルスケア', consumer_staples: '生活必需品',
                utilities: 'ユーティリティ', real_estate: '不動産',
              }
              const color = score > 75 ? 'var(--success)' : score > 55 ? 'var(--accent)' : 'var(--warning)'
              return (
                <div key={sector} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{names[sector] ?? sector}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}</span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* === イベントカレンダー === */}
      <div>
        <div className="section-header">
          <span className="section-title">今後の重要イベント</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {marketEvents.map((event) => {
            const importanceColor = event.importance === 'high' ? 'var(--danger)' : event.importance === 'medium' ? 'var(--warning)' : 'var(--text-muted)'
            const dateStr = format(new Date(event.scheduled_at), 'M/d(E) HH:mm', { locale: ja })
            return (
              <div key={event.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: importanceColor, padding: '2px 6px', background: `${importanceColor}1a`, borderRadius: 4 }}>
                      {event.importance === 'high' ? '重要' : event.importance === 'medium' ? '注目' : '参考'}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{event.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{dateStr}</span>
                </div>
                {event.expected_value && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    予想: {event.expected_value}
                  </div>
                )}
                {event.note && (
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{event.note}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 注意書き */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: 8 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          ⚠️ このデータは投資判断の支援情報です。将来の成果を保証するものではありません。
          実際の投資判断はご自身の責任で行ってください。データは米国市場引け後に更新されます。
        </p>
      </div>
    </div>
  )
}
