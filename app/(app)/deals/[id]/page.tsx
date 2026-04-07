'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, User, Zap, BookOpen, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getConfidenceColor } from '@/lib/ui'

const SIZE_CONFIG = {
  skip: { label: '今回は見送りが有力', color: 'var(--danger)', bg: 'var(--danger-dim)' },
  paper: { label: '模擬ディールで試す', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  small: { label: '小さめで実行可', color: 'var(--warning)', bg: 'var(--warning-dim)' },
  standard: { label: '標準サイズで実行可', color: 'var(--success)', bg: 'var(--success-dim)' },
}

export default function DealDetailPage() {
  const { id } = useParams()
  const { deals, startPaperTrade, skipDeal, paperTrades, skipReviews } = useAppStore()

  const router = useRouter()
  const [showInvalidation, setShowInvalidation] = useState(false)
  const [showCounterScenario, setShowCounterScenario] = useState(false)
  const [checkList, setCheckList] = useState({
    understood: false,
    riskOk: false,
    calm: false,
  })
  const [showPaperModal, setShowPaperModal] = useState(false)
  const [amount, setAmount] = useState('500000')
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [skipReason, setSkipReason] = useState('')
  const [action, setAction] = useState<'execute' | 'paper' | 'skip' | 'later' | null>(null)

  const deal = deals.find((d) => d.id === id)
  if (!deal) return (
    <div style={{ paddingTop: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
      ディールが見つかりません
    </div>
  )

  const fit = deal.execution_fit
  const fitConf = fit ? SIZE_CONFIG[fit.size_recommendation] : SIZE_CONFIG.paper
  const allChecked = Object.values(checkList).every(Boolean)
  const riskColor = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', 'very-high': '#e05757' }[deal.risk_level]

  // 重複チェック
  const activePaperTrade = paperTrades.find(t => t.deal_id === id && t.status === 'open')
  const isSkipped = skipReviews.some(r => r.deal_id === id)

  const REC_LEVEL_COLORS: Record<string, string> = { S: '#FFD700', A: 'var(--accent)', B: 'var(--success)', C: 'var(--text-muted)' }
  const recColor = deal.recommendation_level ? REC_LEVEL_COLORS[deal.recommendation_level] || 'var(--text-muted)' : 'var(--text-muted)'

  const handlePaperStart = () => {
    startPaperTrade(deal.id, parseInt(amount))
    setShowPaperModal(false)
    router.push('/paper-trades')
  }

  const handleSkipSave = () => {
    skipDeal(deal.id, skipReason || '自身の判断で見送り')
    setShowSkipModal(false)
    setAction('skip')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back */}
      <div style={{ paddingTop: 8 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, marginBottom: 12, padding: 0 }}>
          <ArrowLeft size={16} /> 戻る
        </button>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
          {deal.recommendation_level && (
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: recColor, color: '#000', fontWeight: 900 }}>
              Rank {deal.recommendation_level}
            </span>
          )}
          {deal.target_etfs.map((e) => (
            <span key={e.ticker} className="badge badge-accent">{e.ticker}</span>
          ))}
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${riskColor}1a`, color: riskColor, fontWeight: 600 }}>
            リスク{deal.risk_level}
          </span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${getConfidenceColor(deal.confidence_score)}22`, color: getConfidenceColor(deal.confidence_score), fontWeight: 600 }}>
            確信度 {deal.confidence_score}%
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
          {deal.name_ja}
        </h1>
      </div>

      {/* 推奨アクションと根拠 */}
      <div style={{ padding: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>推奨アクション</div>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: deal.recommendation_rationale ? 12 : 0 }}>{deal.recommended_action}</p>
        
        {deal.recommendation_rationale && (
          <>
            <div style={{ width: '100%', height: 1, background: 'var(--border)', margin: '12px 0' }} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>抽出ロジック（根拠）</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{deal.recommendation_rationale}</p>
          </>
        )}
      </div>

      {/* イベント前注意 */}
      {deal.event_caution_note && (
        <div className="glass-panel" style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'linear-gradient(135deg, var(--warning-dim), rgba(232, 167, 43, 0.05))', border: '1px solid rgba(232,167,43,0.25)' }}>
          <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', marginBottom: 2 }}>イベント前注意</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{deal.event_caution_note}</p>
          </div>
        </div>
      )}

      {/* 実行適合判定 */}
      {fit && (
        <div className="glass-panel" style={{ border: `1px solid ${fitConf.color}33`, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <User size={16} color={fitConf.color} />
            <span style={{ fontSize: 13, fontWeight: 700, color: fitConf.color }}>あなたとの相性</span>
          </div>

          {/* スコアバー */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              { label: '市場適合', score: fit.market_fit_score, color: 'var(--accent)' },
              { label: 'あなた適合', score: fit.user_fit_score, color: fit.user_fit_score >= 65 ? 'var(--success)' : fit.user_fit_score >= 50 ? 'var(--warning)' : 'var(--danger)' },
            ].map(({ label, score, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}/100</span>
                </div>
                <div className="score-bar-track" style={{ height: 5 }}>
                  <div className="score-bar-fill" style={{ width: `${score}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 10 }}>
            {fit.summary_text}
          </p>

          {/* 適合理由 */}
          {fit.fit_reasons.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {fit.fit_reasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* 懸念事項 */}
          {fit.concern_factors.length > 0 && (
            <div>
              {fit.concern_factors.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  <AlertTriangle size={12} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 12, padding: '8px 12px', background: fitConf.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: fitConf.color }}>
              <Zap size={12} style={{ display: 'inline', marginRight: 4 }} />
              {fitConf.label}
            </span>
          </div>
        </div>
      )}

      {/* エントリー / 利確 / 損切りライン */}
      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          取引条件
        </div>
        {[
          { label: 'エントリー条件', value: deal.entry_condition, color: 'var(--accent)', Icon: TrendingUp },
          { label: '利確ライン', value: deal.take_profit_line, color: 'var(--success)', Icon: CheckCircle },
          { label: '損切りライン', value: deal.stop_loss_line, color: 'var(--danger)', Icon: XCircle },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} style={{ marginBottom: 12, padding: '10px', background: 'var(--bg-elevated)', borderRadius: 8, borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
              <Icon size={12} color={color} />
              <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{value}</p>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Clock size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>想定保有期間: {deal.hold_period_days}</span>
        </div>
      </div>

      {/* 前提崩れ条件（展開式） */}
      <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(208,90,90,0.2)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <button
          onClick={() => setShowInvalidation(!showInvalidation)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <XCircle size={14} color="var(--danger)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)' }}>前提崩れ条件</span>
          </div>
          {showInvalidation ? <ChevronUp size={14} color="var(--danger)" /> : <ChevronDown size={14} color="var(--danger)" />}
        </button>
        {showInvalidation && (
          <div style={{ padding: '0 14px 12px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{deal.invalidation_condition}</p>
          </div>
        )}
      </div>

      {/* 反対シナリオ（展開式） */}
      <div style={{ background: 'var(--warning-dim)', border: '1px solid rgba(232,167,43,0.2)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <button
          onClick={() => setShowCounterScenario(!showCounterScenario)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <TrendingDown size={14} color="var(--warning)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>反対シナリオ</span>
          </div>
          {showCounterScenario ? <ChevronUp size={14} color="var(--warning)" /> : <ChevronDown size={14} color="var(--warning)" />}
        </button>
        {showCounterScenario && (
          <div style={{ padding: '0 14px 12px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{deal.counter_scenario}</p>
          </div>
        )}
      </div>

      {/* 類似過去ケース */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>📚 類似過去ケース</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{deal.similar_past_case}</p>
      </div>

      {/* アクション制御：重複チェックに基づく出し分け */}
      {activePaperTrade ? (
        <div className="glass-panel" style={{ padding: '16px', background: 'linear-gradient(135deg, var(--accent-dim), rgba(26, 32, 53, 0.4))', border: '1px solid rgba(91,138,244,0.3)', textAlign: 'center' }}>
          <Zap size={24} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>
            現在このディールは実行中です
          </div>
          <button 
            className="btn btn-primary btn-full" 
            onClick={() => router.push('/paper-trades')}
          >
            ペーパートレード画面を見る
          </button>
        </div>
      ) : isSkipped || action === 'skip' ? (
        <div className="glass-panel" style={{ padding: '16px', background: 'linear-gradient(135deg, var(--bg-elevated), rgba(26, 32, 53, 0.4))', border: '1px solid var(--border)', textAlign: 'center' }}>
          <CheckCircle size={24} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 8 }}>
            このディールは見送りを記録済みです
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>
            見送りは正当な判断です。後日「振り返り」タブから冷静な判断結果を確認できます。
          </p>
        </div>
      ) : (
        <>
          {/* === 実行前チェック === */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>
              <BookOpen size={14} style={{ display: 'inline', marginRight: 6 }} />
              実行前チェック
            </div>
            {[
              { key: 'understood' as const, label: 'このディール内容を理解した' },
              { key: 'riskOk' as const, label: 'リスクは自分の許容範囲内である' },
              { key: 'calm' as const, label: '今の感情は冷静である' },
            ].map(({ key, label }) => (
              <div
                key={key}
                onClick={() => setCheckList(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: checkList[key] ? 'var(--success-dim)' : 'var(--bg-elevated)', border: `1px solid ${checkList[key] ? 'rgba(74,186,135,0.3)' : 'var(--border)'}`, transition: 'all 0.15s ease' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${checkList[key] ? 'var(--success)' : 'var(--border-strong)'}`, background: checkList[key] ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {checkList[key] && <CheckCircle size={12} color="white" />}
                </div>
                <span style={{ fontSize: 13, color: checkList[key] ? 'var(--success)' : 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>

          {!allChecked && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: -4 }}>
              👆 実行前チェックをすべて完了するとボタンが押せます
            </div>
          )}

          {/* アクションボタン群 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => { setShowPaperModal(true); setAction('paper') }}
              disabled={!allChecked}
              className="btn btn-primary"
              style={{ opacity: allChecked ? 1 : 0.4 }}
            >
              模擬で試す
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowSkipModal(true)}
            >
              今回は見送る
            </button>
          </div>
        </>
      )}

      {/* 見送りモーダル */}
      {showSkipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 400, padding: 24, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
              このディールを見送りますか？
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              見送りの理由を記録しておくことで、将来似た局面が来た時に振り返り（レビュー）が可能になります。
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                '懸念材料が多い（インフレ指標等）',
                '保有中ポジションとの相関が高い',
                '今の感情が不安定、ルール判断ができない',
                'その他の理由',
              ].map(reason => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 12, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: skipReason === reason ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                  <input
                    type="radio"
                    name="skipReason"
                    value={reason}
                    checked={skipReason === reason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{reason}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowSkipModal(false)}>
                キャンセル
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSkipSave}>
                記録する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模擬ディール開始モーダル */}
      {showPaperModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200, padding: '0 0 0 0' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px', width: '100%', maxWidth: 480 }}>
            <div style={{ width: 40, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              ペーパートレードを開始しますか？
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {deal.name_ja}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                仮想投資額（円）
              </label>
              <input
                className="input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                ✅ この条件で模擬トレードを開始します。<br/>
                ※ 実際の資金は動きません。仮想金額での練習です。
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowPaperModal(false)}>キャンセル</button>
              <button className="btn btn-primary btn-full" onClick={handlePaperStart}>開始を確定する</button>
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, paddingBottom: 8 }}>
        これは投資判断の支援情報です。将来の成果を保証しません。<br />
        実行の可否はご自身の責任でご判断ください。
      </p>
    </div>
  )
}
