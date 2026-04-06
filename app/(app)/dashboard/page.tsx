'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useState, useTransition } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, BarChart2, RefreshCw, HelpCircle } from 'lucide-react'
import { generateDashboardInsights } from '@/app/actions/ai'

function StatBlock({ label, value, unit, color, subLabel }: {
  label: string; value: string | number; unit?: string; color?: string; subLabel?: string
}) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color ?? 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}{unit}
      </div>
      {subLabel && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{subLabel}</div>}
    </div>
  )
}

function InsightCard({ insight, index }: {
  insight: { category: string; title: string; suggestion: string; severity: 'positive' | 'neutral' | 'warning' }
  index: number
}) {
  const conf = {
    positive: { border: 'rgba(74,186,135,0.2)', bg: 'var(--success-dim)', color: 'var(--success)', icon: CheckCircle },
    neutral: { border: 'var(--border)', bg: 'var(--bg-elevated)', color: 'var(--text-secondary)', icon: BarChart2 },
    warning: { border: 'rgba(232,167,43,0.2)', bg: 'var(--warning-dim)', color: 'var(--warning)', icon: AlertTriangle },
  }[insight.severity]
  const Icon = conf.icon

  return (
    <div style={{ background: conf.bg, border: `1px solid ${conf.border}`, borderRadius: 'var(--radius-md)', padding: '14px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
        <Icon size={14} color={conf.color} style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: conf.color }}>{insight.title}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{insight.suggestion}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { dashboardData: d } = useAppStore()
  const { performance, behavior, psychology, market_fit, insights: defaultInsights } = d

  const [isPending, startTransition] = useTransition()
  const [aiInsights, setAiInsights] = useState<any[] | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  const rr = (performance.avg_win / Math.abs(performance.avg_loss)).toFixed(2)

  const handleGenerateAI = () => {
    startTransition(async () => {
      try {
        const result = await generateDashboardInsights(d)
        setAiInsights(result)
      } catch (err) {
        console.error(err)
        alert('AI生成に失敗しました（.env.local に OPENAI_API_KEY が設定されているか確認してください）')
      }
    })
  }

  const displayedInsights = aiInsights || defaultInsights

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            ダッシュボード
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            数字ではなく、示唆で改善を確認します
          </p>
        </div>
        <button 
          onClick={() => setShowHelp(true)}
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {/* ===== 今週の示唆 ===== */}
      <div className="glass-panel" style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(91,138,244,0.1), rgba(26,32,53,0.4))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Zap size={11} style={{ display: 'inline', marginRight: 4 }} />
            {aiInsights ? 'AI 専用コーチの示唆' : '今週の示唆'}
          </div>
          {!aiInsights && (
            <button
              onClick={handleGenerateAI}
              disabled={isPending}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', background: 'var(--accent-dim)', border: '1px solid rgba(91,138,244,0.3)',
                borderRadius: 'var(--radius-full)', color: 'var(--accent)', fontSize: 11, fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1
              }}
            >
              <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
              {isPending ? 'AI分析中...' : 'AIに分析させる'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {displayedInsights.map((insight, i) => (
            <InsightCard key={i} insight={insight} index={i} />
          ))}
        </div>
      </div>

      {/* ===== パフォーマンス ===== */}
      <div className="glass-panel" style={{ padding: '16px 14px' }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">パフォーマンス</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{performance.trade_count}件</span>
        </div>

        {/* 累積PnL大きく表示 */}
        <div style={{
          background: performance.total_pnl >= 0 ? 'var(--success-dim)' : 'var(--danger-dim)',
          border: `1px solid ${performance.total_pnl >= 0 ? 'rgba(74,186,135,0.2)' : 'rgba(208,90,90,0.2)'}`,
          borderRadius: 'var(--radius-xl)', padding: '20px', textAlign: 'center', marginBottom: 10,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>累積損益（模擬）</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {performance.total_pnl >= 0
              ? <TrendingUp size={24} color="var(--success)" />
              : <TrendingDown size={24} color="var(--danger)" />
            }
            <span style={{ fontSize: 32, fontWeight: 800, color: performance.total_pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
              {performance.total_pnl >= 0 ? '+' : ''}¥{performance.total_pnl.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: 14, color: performance.total_pnl_pct >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600, marginTop: 4 }}>
            {performance.total_pnl_pct >= 0 ? '+' : ''}{performance.total_pnl_pct.toFixed(1)}%
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatBlock label="勝率" value={performance.win_rate} unit="%" color={performance.win_rate >= 55 ? 'var(--success)' : performance.win_rate >= 45 ? 'var(--warning)' : 'var(--danger)'} />
          <StatBlock label="リスクリワード" value={rr} color={parseFloat(rr) >= 1.5 ? 'var(--success)' : 'var(--warning)'} subLabel="目標1.5以上" />
          <StatBlock label="平均利益" value={`+${performance.avg_win.toFixed(1)}`} unit="%" color="var(--success)" />
          <StatBlock label="平均損失" value={`-${Math.abs(performance.avg_loss).toFixed(1)}`} unit="%" color="var(--danger)" />
          <StatBlock label="期待値" value={`+${performance.expectancy.toFixed(1)}`} unit="%" color="var(--accent)" subLabel="1取引あたり" />
          <StatBlock label="最大DD" value={`-${Math.abs(performance.max_drawdown).toFixed(1)}`} unit="%" color="var(--warning)" subLabel="最大ドローダウン" />
        </div>
        <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '3px solid var(--accent)' }}>
          💡 期待値はプラスを維持しています。勝率よりリスクリワード（現在{rr}）を意識した今のスタイルが機能しています。このまま継続しましょう。
        </div>
      </div>

      {/* ===== 行動品質 ===== */}
      <div className="glass-panel" style={{ padding: '16px 14px' }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">行動品質</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(
            [
              { label: 'ルール遵守率', val: behavior.rule_compliance_rate, good: (v: number) => v >= 75, unit: '%' },
              { label: '通知実行率', val: behavior.notification_follow_rate, good: (v: number) => v >= 65, unit: '%' },
              { label: '見送り判断率', val: behavior.skip_rate, good: (v: number) => v >= 20, unit: '%' },
              { label: '飛び乗り率', val: behavior.fomo_chase_rate, good: (v: number) => v <= 15, unit: '%' },
              { label: '早期利確率', val: behavior.early_exit_rate, good: (v: number) => v <= 25, unit: '%' },
              { label: '損切り遅延率', val: behavior.late_stop_rate, good: (v: number) => v <= 10, unit: '%' },
            ] as const
          ).map(({ label, val, good, unit }) => {
            const isGood = good(val)
            const color = isGood ? 'var(--success)' : 'var(--warning)'
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}{unit}</span>
                </div>
                <div className="score-bar-track" style={{ height: 5 }}>
                  <div className="score-bar-fill" style={{ width: `${val}%`, background: color }} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '3px solid var(--success)' }}>
          💡 見送り判断率が{behavior.skip_rate}%と良好です。無駄な被弾を防ぎ、確度が高いディールのみに絞り込めています。資金管理の土台ができています。
        </div>
      </div>

      {/* ===== 心理・感情 ===== */}
      <div className="glass-panel" style={{ padding: '16px 14px' }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">感情別成績</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div style={{ background: 'var(--success-dim)', border: '1px solid rgba(74,186,135,0.2)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>😌</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>冷静時</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)' }}>{psychology.calm_win_rate}%</div>
          </div>
          <div style={{ background: 'var(--warning-dim)', border: '1px solid rgba(232,167,43,0.2)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>😟</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>不安時</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--warning)' }}>{psychology.anxious_win_rate}%</div>
          </div>
          <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(208,90,90,0.2)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>🤑</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>欲張り時</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--danger)' }}>{psychology.greedy_win_rate}%</div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: '3px solid var(--warning)' }}>
          💡 冷静時と不安時で勝率に{psychology.calm_win_rate - psychology.anxious_win_rate}%の差があります。感情が崩れた日は、エントリーを小さくするか、見送ることを検討しましょう。
        </div>
      </div>

      {/* ===== 市場適合 ===== */}
      <div className="glass-panel" style={{ padding: '16px 14px' }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <span className="section-title">市場環境別成績</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'リスクオン局面', val: market_fit.risk_on_win_rate, emoji: '🚀' },
            { label: '金利低下局面', val: market_fit.rate_decline_win_rate, emoji: '📉' },
            { label: 'リスクオフ局面', val: market_fit.risk_off_win_rate, emoji: '🛡️' },
            { label: '高ボラ局面', val: market_fit.high_vol_win_rate, emoji: '⚡' },
          ].map(({ label, val, emoji }) => {
            const color = val >= 60 ? 'var(--success)' : val >= 45 ? 'var(--warning)' : 'var(--danger)'
            return (
              <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 16, width: 24, flexShrink: 0 }}>{emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>勝率{val}%</span>
                  </div>
                  <div className="score-bar-track" style={{ height: 4 }}>
                    <div className="score-bar-fill" style={{ width: `${val}%`, background: color }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--accent-dim)', borderRadius: 8, fontSize: 12, color: 'var(--accent)', lineHeight: 1.5, border: '1px solid rgba(91,138,244,0.2)', borderLeft: '3px solid var(--accent)' }}>
          🎯 現在は<strong>金利低下局面</strong>です。あなたが最も得意とする市場環境です。勝負できる局面ではしっかりリスクを取りましょう。
        </div>
      </div>

      {/* 模擬卒業判定 */}
      <div className="glass-panel" style={{ padding: '16px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
          実運用準備度チェック
        </div>
        {[
          { label: '模擬ディール30件以上', done: false, current: '13件完了' },
          { label: '期待値プラス', done: performance.expectancy > 0, current: `+${performance.expectancy.toFixed(1)}%` },
          { label: 'ルール遵守率80%以上', done: behavior.rule_compliance_rate >= 80, current: `現在${behavior.rule_compliance_rate}%` },
          { label: '感情起因の逸脱が減っている', done: false, current: '振り返りを続けて確認' },
        ].map(({ label, done, current }) => (
          <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              background: done ? 'var(--success)' : 'var(--bg-elevated)',
              border: `2px solid ${done ? 'var(--success)' : 'var(--border-strong)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {done && <CheckCircle size={12} color="white" />}
            </div>
            <div>
              <div style={{ fontSize: 13, color: done ? 'var(--success)' : 'var(--text-secondary)' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{current}</div>
            </div>
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          すべての条件を満たすと、実運用向けの通知モードに移行できます。
          焦らず、模擬で十分に練習しましょう。
        </p>
      </div>

      {/* ヘルプモーダル */}
      {showHelp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowHelp(false)} />
          <div style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, width: '100%', maxWidth: 400, zIndex: 101, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={20} color="var(--accent)" />
              ダッシュボードの見方
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>パフォーマンス</strong><br/>
                勝率やリスクリワード（平均利益 ÷ 平均損失）など、トレードの基本的な結果を示します。「RR」が1.0以上なら、1回の負けより1回の勝ちの方が大きいことを意味します。
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>行動品質</strong><br/>
                設定したルール通りにトレードできたか（ルール遵守率）や、事前の計画通りに「実行」できた割合を示します。
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>心理状態</strong><br/>
                「振り返り」で入力した判断時の感情の傾向です。「冷静」である割合が高いほど安定した精神状態を保てています。
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>市場適合度</strong><br/>
                あなたの戦略と現在の相場環境の噛み合い具合を示します。不調なときは、無理にエントリーしない（見送る）判断が重要です。
              </div>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} onClick={() => setShowHelp(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
