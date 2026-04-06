'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useState, useTransition } from 'react'
import { CheckCircle, Clock, Star, Zap, Bot, RefreshCw } from 'lucide-react'
import { EmotionState } from '@/types'
import { analyzeTradeMemo } from '@/app/actions/ai'

const EMOTION_OPTIONS: { value: EmotionState; label: string; emoji: string }[] = [
  { value: 'calm', label: '冷静', emoji: '😌' },
  { value: 'anxious', label: '不安', emoji: '😟' },
  { value: 'excited', label: '興奮', emoji: '😆' },
  { value: 'fearful', label: '恐怖', emoji: '😨' },
  { value: 'greedy', label: '欲張り', emoji: '🤑' },
]

type ReviewStep = 'list' | 'light' | 'done'

export default function ReviewsPage() {
  const { pendingReviews, reviews, skipReviews, submitLightReview } = useAppStore()
  const [step, setStep] = useState<ReviewStep>('list')
  const [tab, setTab] = useState<'reviews' | 'skips'>('reviews')
  const [currentReview, setCurrentReview] = useState<(typeof pendingReviews)[0] | null>(null)

  // Light review state
  const [executed, setExecuted] = useState(true)
  const [satisfaction, setSatisfaction] = useState(3)
  const [emotion, setEmotion] = useState<EmotionState>('calm')
  const [ruleFollowed, setRuleFollowed] = useState(true)

  // AI Analysis state
  const [memo, setMemo] = useState('')
  const [isPending, startTransition] = useTransition()
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  const startReview = (rev: typeof pendingReviews[0]) => {
    setCurrentReview(rev)
    setStep('light')
    setExecuted(true)
    setSatisfaction(3)
    setEmotion('calm')
    setRuleFollowed(true)
    setMemo('')
    setAiAnalysis(null)
  }

  const handleAnalyzeAI = () => {
    if (!memo) return
    startTransition(async () => {
      try {
        const result = await analyzeTradeMemo(memo)
        setAiAnalysis(result)
        // Automatically sync UI inputs based on AI reading
        setEmotion(result.emotion)
        setRuleFollowed(result.ruleFollowed)
      } catch (err) {
        console.error(err)
        alert('AI分析に失敗しました。')
      }
    })
  }

  const submitReview = () => {
    if (!currentReview) return
    submitLightReview(currentReview.trade_id, {
      executed,
      satisfaction_score: satisfaction,
      emotion_state: emotion,
      rule_followed: ruleFollowed,
    })
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>振り返り完了！</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280 }}>
          振り返りの積み重ねが、判断の質を高めていきます。
        </p>
        <button className="btn btn-primary" onClick={() => setStep('list')}>
          一覧に戻る
        </button>
      </div>
    )
  }

  if (step === 'light' && currentReview) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ paddingTop: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            <Zap size={11} style={{ display: 'inline', marginRight: 4 }} />
            ライトレビュー（20秒）
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            {currentReview.deal_name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            4つの質問に答えるだけです。深く考えすぎなくて大丈夫。
          </p>
        </div>

        {/* Q1: 実行したか */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            このディールを実行しましたか？
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[true, false].map((v) => (
              <button key={String(v)} onClick={() => setExecuted(v)} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                border: `2px solid ${executed === v ? 'var(--accent)' : 'var(--border)'}`,
                background: executed === v ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: executed === v ? 'var(--accent)' : 'var(--text-secondary)',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
                {v ? '✅ 実行した' : '⏭️ 見送った'}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: 納得感 */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            判断への納得感は？
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} onClick={() => setSatisfaction(v)} style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                border: `2px solid ${satisfaction === v ? 'var(--warning)' : 'var(--border)'}`,
                background: satisfaction === v ? 'var(--warning-dim)' : 'var(--bg-elevated)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}>
                <Star size={20} color={satisfaction >= v ? 'var(--warning)' : 'var(--text-muted)'} fill={satisfaction >= v ? 'var(--warning)' : 'none'} />
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            {['', '全く納得できない', 'あまり納得できない', '普通', 'やや納得している', '十分納得している'][satisfaction]}
          </div>
        </div>

        {/* Q3: 感情状態 */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            判断時の感情は？
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EMOTION_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => setEmotion(opt.value)} style={{
                padding: '10px 14px', borderRadius: 'var(--radius-full)',
                border: `2px solid ${emotion === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: emotion === opt.value ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: emotion === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.15s ease',
              }}>
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Q4: ルール通りか */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            ルール通りの判断でしたか？
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[true, false].map((v) => (
              <button key={String(v)} onClick={() => setRuleFollowed(v)} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                border: `2px solid ${ruleFollowed === v ? (v ? 'var(--success)' : 'var(--warning)') : 'var(--border)'}`,
                background: ruleFollowed === v ? (v ? 'var(--success-dim)' : 'var(--warning-dim)') : 'var(--bg-elevated)',
                color: ruleFollowed === v ? (v ? 'var(--success)' : 'var(--warning)') : 'var(--text-secondary)',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
                {v ? '✓ ルール通り' : '△ 逸脱あり'}
              </button>
            ))}
          </div>
          {!ruleFollowed && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
              ルールからの逸脱は、改善のヒントです。責める必要はありません。
            </p>
          )}
        </div>

        {/* トレードメモ（AI分析） */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              トレードメモ
            </div>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="「指標発表前で少し不安だったが...」「確信度が低いけど乗ってみた」など、率直な気持ちを書いてください"
            className="input"
            style={{ minHeight: 80, resize: 'vertical', display: 'block', width: '100%', marginBottom: 10, fontSize: 13 }}
          />
          <button
            onClick={handleAnalyzeAI}
            disabled={isPending || !memo.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '10px', background: 'var(--accent-dim)', border: '1px solid rgba(91,138,244,0.3)',
              borderRadius: 'var(--radius-md)', color: 'var(--accent)', fontSize: 13, fontWeight: 700,
              cursor: (isPending || !memo.trim()) ? 'not-allowed' : 'pointer', opacity: (isPending || !memo.trim()) ? 0.6 : 1
            }}
          >
            {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
            {isPending ? 'AIで分析中...' : 'AIでメモを解析し、感情・ルール遵守を判定する'}
          </button>

          {aiAnalysis && (
            <div style={{ marginTop: 12, padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>🤖 AIコーチのフィードバック</div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{aiAnalysis.analysis}</p>
              {aiAnalysis.fomoDetected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 10px', background: 'var(--warning-dim)', color: 'var(--warning)', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  ⚠️ FOMO（飛び乗り）の傾向が検出されました
                </div>
              )}
            </div>
          )}
        </div>

        <button className="btn btn-primary btn-full" onClick={submitReview}>
          振り返りを完了する
        </button>

        <button className="btn btn-ghost" onClick={() => setStep('list')} style={{ marginBottom: 8 }}>
          あとで振り返る
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ paddingTop: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          振り返り
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          結果だけでなく、判断の質を振り返ります
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => setTab('reviews')}
          style={{ flex: 1, padding: '10px', background: tab === 'reviews' ? 'var(--bg-hover)' : 'transparent', borderBottom: tab === 'reviews' ? '2px solid var(--accent)' : '2px solid transparent', color: tab === 'reviews' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
          className="btn-ghost"
        >
          振り返り ({reviews.length + pendingReviews.length})
        </button>
        <button
          onClick={() => setTab('skips')}
          style={{ flex: 1, padding: '10px', background: tab === 'skips' ? 'var(--bg-hover)' : 'transparent', borderBottom: tab === 'skips' ? '2px solid var(--accent)' : '2px solid transparent', color: tab === 'skips' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
          className="btn-ghost"
        >
          見送り ({skipReviews.length})
        </button>
      </div>

      {tab === 'reviews' && (
        <>
          {/* 未完了 */}
      {pendingReviews.length > 0 && (
        <div>
          <div className="section-header">
            <span className="section-title">未完了の振り返り</span>
            <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>{pendingReviews.length}件</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingReviews.map((rev) => (
              <div key={rev.id} style={{ background: 'var(--accent-dim)', border: '1px solid rgba(91,138,244,0.25)', borderRadius: 'var(--radius-lg)', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{rev.deal_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={12} color="var(--accent)" />
                      <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                        {rev.type === 'light' ? 'ライトレビュー（20秒）' : '通常レビュー（1分）'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm btn-full" onClick={() => startReview(rev)}>
                  振り返りを始める
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 完了済み */}
      <div>
        <div className="section-header">
          <span className="section-title">完了した振り返り</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reviews.length}件</span>
        </div>

        {reviews.length === 0 && pendingReviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div>まだ振り返りはありません</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>模擬ディールを完了すると振り返りが追加されます</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <CheckCircle size={14} color="var(--success)" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>振り返り完了</span>
                  </div>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1,2,3,4,5].map((v) => (
                      <Star key={v} size={12} color={r.satisfaction_score >= v ? 'var(--warning)' : 'var(--text-muted)'} fill={r.satisfaction_score >= v ? 'var(--warning)' : 'none'} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{r.executed ? '✅ 実行' : '⏭️ 見送り'}</span>
                  <span>{EMOTION_OPTIONS.find(e => e.value === r.emotion_state)?.emoji} {r.emotion_state}</span>
                  <span>{r.rule_followed ? '✓ ルール通り' : '△ 逸脱あり'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* 見送り履歴 */}
      {tab === 'skips' && (
        <div>
          <div className="glass-panel" style={{ padding: '16px', background: 'linear-gradient(135deg, var(--accent-dim), rgba(26,32,53,0.4))', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
              💡 休むも相場
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              見送りは「何もしない」のではなく、「ポジションを持たない」という立派な投資判断です。<br/>
              無駄な損失を防ぐ重要なスキルとして蓄積されています。
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {skipReviews.map((r) => (
              <div key={r.id} className="card-elevated" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>見送り記録</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  理由: {r.skip_reason}
                </div>
              </div>
            ))}
            {skipReviews.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                見送りの記録はまだありません
              </div>
            )}
          </div>
        </div>
      )}

      {/* 振り返りの意義 */}
      <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
          📊 振り返りが大切な理由
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          結果（損益）と判断（根拠・感情・ルール遵守）を分けて振り返ることで、
          良い結果が出た偶然と、再現できる判断の質を区別できます。
          これがダッシュボードの示唆につながります。
        </p>
      </div>
    </div>
  )
}
