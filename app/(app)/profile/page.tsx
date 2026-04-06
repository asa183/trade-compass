'use client'

import { useAppStore } from '@/stores/useAppStore'
import { User, BarChart2, Shield, BookOpen, LogOut, ChevronRight, HelpCircle } from 'lucide-react'

const EXP_LABEL: Record<string, string> = { beginner: '初級', intermediate: '中級', advanced: '上級' }
const HOLD_LABEL: Record<string, string> = { day: '1日', swing: '数日〜2週', mid: '1〜3ヶ月', long: '長期' }
const RISK_LABEL: Record<string, string> = { 'very-low': '非常に低い', low: '低め', medium: '中程度', high: '高め' }
const GOAL_LABEL: Record<string, string> = { growth: '成長重視', income: '収入・配当', preservation: '資産保全', learning: '学習目的' }

export default function ProfilePage() {
  const { user, profile, logout } = useAppStore()
  if (!user || !profile) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ヘッダー */}
      <div style={{ paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={24} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{user.display_name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</div>
          </div>
        </div>
      </div>

      {/* 投資スタイル */}
      <div>
        <div className="section-header">
          <span className="section-title">投資スタイル</span>
        </div>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: '投資経験', value: EXP_LABEL[profile.experience_level] ?? profile.experience_level },
            { label: '保有期間', value: HOLD_LABEL[profile.hold_period] ?? profile.hold_period },
            { label: 'リスク許容度', value: RISK_LABEL[profile.risk_tolerance] ?? profile.risk_tolerance },
            { label: '投資目的', value: GOAL_LABEL[profile.investment_goal] ?? profile.investment_goal },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 行動傾向 */}
      <div>
        <div className="section-header">
          <span className="section-title">行動傾向（学習中）</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: '高ボラ耐性', val: profile.high_vol_tolerance, color: 'var(--accent)' },
            { label: '夜間耐性', val: profile.overnight_tolerance, color: 'var(--accent)' },
            { label: 'ルール遵守率', val: profile.rule_compliance_rate, color: profile.rule_compliance_rate >= 75 ? 'var(--success)' : 'var(--warning)' },
            { label: '通知実行率', val: profile.notification_follow_rate, color: 'var(--accent)' },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}/100</span>
              </div>
              <div className="score-bar-track" style={{ height: 5 }}>
                <div className="score-bar-fill" style={{ width: `${val}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 失敗パターン */}
      {profile.failure_patterns.length > 0 && (
        <div>
          <div className="section-header">
            <span className="section-title">改善中の傾向</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.failure_patterns.map((fp) => {
              const labels: Record<string, string> = {
                'buy-at-top': '高値掴みの傾向',
                'panic-sell': '狼狽売りの傾向',
                'late-stop-loss': '損切り遅れの傾向',
                'early-profit-taking': '利確が早い傾向',
                'fomo-chase': '飛び乗りの傾向',
              }
              return (
                <div key={fp} style={{ padding: '10px 14px', background: 'var(--warning-dim)', border: '1px solid rgba(232,167,43,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--warning)' }}>⚠️</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{labels[fp] ?? fp}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)' }}>改善中</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* メニュー */}
      <div>
        {[
          { icon: BarChart2, label: 'ダッシュボード', href: '/dashboard' },
          { icon: Shield, label: '模擬ディール', href: '/paper-trades' },
          { icon: BookOpen, label: '振り返り', href: '/reviews' },
          { icon: HelpCircle, label: '使い方ガイド', href: '/guide' },
        ].map(({ icon: Icon, label, href }) => (
          <a key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
            <Icon size={18} color="var(--text-muted)" />
            <span style={{ fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{label}</span>
            <ChevronRight size={14} color="var(--text-muted)" />
          </a>
        ))}
      </div>

      {/* 免責 */}
      <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Trade Compass について</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          このアプリは、投資判断の支援を目的としています。<br />
          将来の成果を保証するものではありません。<br />
          実際の投資は、ご自身の判断と責任で行ってください。<br />
          自動売買機能はありません。
        </p>
      </div>

      {/* ログアウト */}
      <button
        onClick={logout}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}
      >
        <LogOut size={16} />
        ログアウト
      </button>
    </div>
  )
}
