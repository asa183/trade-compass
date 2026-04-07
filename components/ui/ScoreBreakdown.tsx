import React from 'react'

export interface ScoreBreakdownProps {
  scoreDetails: {
    regimeFit: number
    trend: number
    volatilityRisk: number
  }
  variant?: 'detailed' | 'compact'
}

export function ScoreBreakdown({ scoreDetails, variant = 'detailed' }: ScoreBreakdownProps) {
  if (variant === 'compact') {
    return (
      <>
        <div style={{ display: 'flex', gap: 4, height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 2 }}>
          <div style={{ flex: 1, backgroundColor: scoreDetails.regimeFit >= 70 ? 'var(--success)' : scoreDetails.regimeFit >= 40 ? 'var(--warning)' : 'var(--danger)', opacity: 0.8 }} title={`Regime Fit: ${scoreDetails.regimeFit}`} />
          <div style={{ flex: 1, backgroundColor: scoreDetails.trend >= 70 ? 'var(--success)' : scoreDetails.trend >= 40 ? 'var(--warning)' : 'var(--danger)', opacity: 0.8 }} title={`Trend: ${scoreDetails.trend}`} />
          <div style={{ flex: 1, backgroundColor: scoreDetails.volatilityRisk <= 30 ? 'var(--success)' : scoreDetails.volatilityRisk <= 60 ? 'var(--warning)' : 'var(--danger)', opacity: 0.8 }} title={`Risk: ${scoreDetails.volatilityRisk}`} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)' }}>
          <span>環境</span>
          <span>勢い</span>
          <span>リスク</span>
        </div>
      </>
    )
  }

  return (
    <div style={{ marginTop: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>スコア内訳</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>
            <span>環境</span><span>{scoreDetails.regimeFit}</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${scoreDetails.regimeFit}%`, backgroundColor: scoreDetails.regimeFit >= 70 ? 'var(--success)' : scoreDetails.regimeFit >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>
            <span>勢い</span><span>{scoreDetails.trend}</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${scoreDetails.trend}%`, backgroundColor: scoreDetails.trend >= 70 ? 'var(--success)' : scoreDetails.trend >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>
            <span>リスク</span><span>{scoreDetails.volatilityRisk}</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${scoreDetails.volatilityRisk}%`, backgroundColor: scoreDetails.volatilityRisk <= 30 ? 'var(--success)' : scoreDetails.volatilityRisk <= 60 ? 'var(--warning)' : 'var(--danger)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

