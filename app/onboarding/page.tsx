'use client'

import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useRouter } from 'next/navigation'
import { OnboardingAnswers } from '@/types'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

const STEPS = 5

interface ChipGroupProps {
  options: { value: string; label: string; emoji?: string }[]
  selected: string
  onSelect: (v: string) => void
}
function ChipGroup({ options, selected, onSelect }: ChipGroupProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onSelect(o.value)}
          className={`chip ${selected === o.value ? 'selected' : ''}`}>
          {o.emoji && <span>{o.emoji}</span>} {o.label}
        </button>
      ))}
    </div>
  )
}

interface MultiChipGroupProps {
  options: { value: string; label: string; emoji?: string }[]
  selected: string[]
  onToggle: (v: string) => void
}
function MultiChipGroup({ options, selected, onToggle }: MultiChipGroupProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onToggle(o.value)}
          className={`chip ${selected.includes(o.value) ? 'selected' : ''}`}>
          {o.emoji && <span>{o.emoji}</span>} {o.label}
        </button>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const { completeOnboarding, user } = useAppStore()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({
    anxiety_triggers: [],
    interest_areas: [],
  })

  const set = <K extends keyof OnboardingAnswers>(k: K, v: OnboardingAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [k]: v }))
  }

  const toggleArr = (key: 'anxiety_triggers' | 'interest_areas', v: string) => {
    setAnswers((prev) => {
      const arr = prev[key] ?? []
      return { ...prev, [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }
    })
  }

  const canNext = (): boolean => {
    if (step === 0) return !!answers.experience_level
    if (step === 1) return !!answers.hold_period && !!answers.risk_tolerance
    if (step === 2) return !!answers.profit_taking_style && !!answers.investment_goal
    if (step === 3) return true
    if (step === 4) return true
    return false
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleFinish = async () => {
    setIsSaving(true)
    try {
      await completeOnboarding(answers as OnboardingAnswers)
      router.push('/home')
    } catch (err: any) {
      alert('保存に失敗しました: ' + (err.message || String(err)))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* ブランド */}
      <div style={{ padding: '24px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: 'white' }}>TC</div>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Trade Compass</span>
      </div>

      {/* プログレスバー */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>投資スタイル診断</span>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{step + 1}/{STEPS}</span>
        </div>
        <div className="score-bar-track" style={{ height: 6 }}>
          <div className="score-bar-fill accent" style={{ width: `${((step + 1) / STEPS) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {step === 0 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>ステップ 1</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              投資の経験はどのくらいですか？
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              株の売買を実際に行った経験で選んでください。
            </p>
            <ChipGroup
              options={[
                { value: 'beginner', label: '初心者（未経験〜1年）', emoji: '🌱' },
                { value: 'intermediate', label: '中級（1〜5年）', emoji: '📈' },
                { value: 'advanced', label: '上級（5年以上）', emoji: '🎯' },
              ]}
              selected={answers.experience_level ?? ''}
              onSelect={(v) => set('experience_level', v as OnboardingAnswers['experience_level'])}
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>ステップ 2</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              どんなスタイルで投資したいですか？
            </h2>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>想定している保有期間</p>
              <ChipGroup
                options={[
                  { value: 'day', label: '1日以内', emoji: '⚡' },
                  { value: 'swing', label: '数日〜2週間', emoji: '🔄' },
                  { value: 'mid', label: '1〜3ヶ月', emoji: '📅' },
                  { value: 'long', label: '長期', emoji: '🏔️' },
                ]}
                selected={answers.hold_period ?? ''}
                onSelect={(v) => set('hold_period', v as OnboardingAnswers['hold_period'])}
              />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>許容できる損失のイメージ</p>
              <ChipGroup
                options={[
                  { value: 'very-low', label: '-2%以下', emoji: '🛡️' },
                  { value: 'low', label: '-5%程度', emoji: '😊' },
                  { value: 'medium', label: '-10%程度', emoji: '😐' },
                  { value: 'high', label: '-20%以上も許容', emoji: '💪' },
                ]}
                selected={answers.risk_tolerance ?? ''}
                onSelect={(v) => set('risk_tolerance', v as OnboardingAnswers['risk_tolerance'])}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>ステップ 3</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              どんな判断傾向がありますか？
            </h2>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>利確のタイミング傾向</p>
              <ChipGroup
                options={[
                  { value: 'early', label: '早めに確定したい', emoji: '🐇' },
                  { value: 'rule-based', label: 'ルール通りにやる', emoji: '📏' },
                  { value: 'patient', label: 'じっくり待てる', emoji: '🐢' },
                  { value: 'let-run', label: '伸ばせる方がいい', emoji: '🚀' },
                ]}
                selected={answers.profit_taking_style ?? ''}
                onSelect={(v) => set('profit_taking_style', v as OnboardingAnswers['profit_taking_style'])}
              />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>投資の目的</p>
              <ChipGroup
                options={[
                  { value: 'growth', label: '資産を増やしたい', emoji: '📈' },
                  { value: 'income', label: '配当収入を得たい', emoji: '💰' },
                  { value: 'preservation', label: 'インフレに負けたくない', emoji: '🏦' },
                  { value: 'learning', label: '学びながら練習したい', emoji: '📚' },
                ]}
                selected={answers.investment_goal ?? ''}
                onSelect={(v) => set('investment_goal', v as OnboardingAnswers['investment_goal'])}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>ステップ 4</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              どんな時に不安になりやすいですか？
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              当てはまるものをすべて選んでください（任意）
            </p>
            <MultiChipGroup
              options={[
                { value: 'big-drop', label: '大きく下落した時', emoji: '📉' },
                { value: 'night-move', label: '夜間に大きく動く時', emoji: '🌙' },
                { value: 'news', label: '悪いニュースが出た時', emoji: '📰' },
                { value: 'losing-streak', label: '連敗が続いている時', emoji: '😞' },
                { value: 'fomo', label: '上がっているのに乗れていない時', emoji: '😰' },
              ]}
              selected={answers.anxiety_triggers ?? []}
              onToggle={(v) => toggleArr('anxiety_triggers', v)}
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>ステップ 5</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              興味のある分野は？
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              優先的に表示するバスケットの参考にします（複数可）
            </p>
            <MultiChipGroup
              options={[
                { value: 'etf', label: 'ETF中心', emoji: '📊' },
                { value: 'tech', label: 'テクノロジー', emoji: '💻' },
                { value: 'semiconductor', label: '半導体', emoji: '⚡' },
                { value: 'dividend', label: '高配当・ディフェンシブ', emoji: '💰' },
                { value: 'growth', label: 'グロース株', emoji: '🚀' },
                { value: 'balanced', label: 'バランス重視', emoji: '⚖️' },
              ]}
              selected={answers.interest_areas ?? []}
              onToggle={(v) => toggleArr('interest_areas', v)}
            />

            <div style={{ marginTop: 24, padding: '16px', background: 'var(--accent-dim)', border: '1px solid rgba(91,138,244,0.25)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CheckCircle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                    診断完了後のこと
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    この情報をもとに、あなたに合った市場レジーム・バスケット・ディールを提示します。
                    使いながら、行動データから判断が更新されていきます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ナビゲーション */}
      <div style={{ padding: '0 20px 40px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ minWidth: 56 }}>
              <ChevronLeft size={18} />
            </button>
          )}
          {step < STEPS - 1 ? (
            <button className="btn btn-primary btn-full" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              次へ <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-full" onClick={handleFinish} disabled={isSaving}>
              <CheckCircle size={16} />
              {isSaving ? '保存中...' : 'はじめる'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
