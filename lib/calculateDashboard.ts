import { PaperTrade, DealReview, SkipReview } from '../types'

export function calculateDashboardData(
  paperTrades: PaperTrade[],
  reviews: DealReview[],
  skipReviews: SkipReview[]
) {
  // --- Initialization ---
  const data = {
    performance: { total_pnl: 0, total_pnl_pct: 0, win_rate: 0, avg_win: 0, avg_loss: 0, risk_reward: 0, expectancy: 0, max_drawdown: 0, trade_count: 0 },
    behavior: { rule_compliance_rate: 0, notification_follow_rate: 0, skip_rate: 0, fomo_chase_rate: 0, early_exit_rate: 0, late_stop_rate: 0 },
    psychology: { calm_win_rate: 0, anxious_win_rate: 0, greedy_win_rate: 0 },
    market_fit: { risk_on_win_rate: 0, risk_off_win_rate: 0, high_vol_win_rate: 0, rate_decline_win_rate: 0 },
    insights: [] as any[]
  }

  const closedTrades = paperTrades.filter(t => t.status === 'closed' && t.result_pnl !== undefined)
  
  if (closedTrades.length === 0) {
    return data
  }

  // --- Performance ---
  const wins = closedTrades.filter(t => (t.result_pnl || 0) > 0)
  const losses = closedTrades.filter(t => (t.result_pnl || 0) <= 0)

  data.performance.trade_count = closedTrades.length
  data.performance.win_rate = (wins.length / closedTrades.length) * 100
  data.performance.total_pnl = closedTrades.reduce((acc, t) => acc + (t.result_pnl || 0), 0)
  data.performance.total_pnl_pct = closedTrades.reduce((acc, t) => acc + (t.result_pct || 0), 0)

  data.performance.avg_win = wins.length > 0 ? wins.reduce((acc, t) => acc + (t.result_pct || 0), 0) / wins.length : 0
  data.performance.avg_loss = losses.length > 0 ? losses.reduce((acc, t) => acc + (t.result_pct || 0), 0) / losses.length : 0
  
  data.performance.risk_reward = data.performance.avg_loss !== 0 ? Math.abs(data.performance.avg_win / data.performance.avg_loss) : 0
  data.performance.expectancy = (data.performance.win_rate / 100) * data.performance.avg_win + (1 - (data.performance.win_rate / 100)) * data.performance.avg_loss

  data.performance.max_drawdown = Math.min(...closedTrades.map(t => t.max_drawdown || 0)) // negative value

  // --- Behavior ---
  if (reviews.length > 0) {
    const defaultReviews = reviews.filter(r => r.rule_followed !== undefined)
    data.behavior.rule_compliance_rate = defaultReviews.length > 0 
      ? (defaultReviews.filter(r => r.rule_followed).length / defaultReviews.length) * 100 
      : 0
    
    // Notification follow (mock based on dummy for now)
    data.behavior.notification_follow_rate = 85

    // Rate of manual early exits instead of take profit
    const manualExits = closedTrades.filter(t => t.exit_reason === 'manual' && (t.result_pnl || 0) > 0)
    data.behavior.early_exit_rate = closedTrades.length > 0 ? (manualExits.length / closedTrades.length) * 100 : 0
  }

  const totalActionCount = paperTrades.length + skipReviews.length
  if (totalActionCount > 0) {
    data.behavior.skip_rate = (skipReviews.length / totalActionCount) * 100
  }

  // --- Psychology ---
  // Connect deals to their review emotions
  const calmTrades = closedTrades.filter(t => reviews.find(r => r.paper_trade_id === t.id)?.emotion_state === 'calm')
  const anxiousTrades = closedTrades.filter(t => reviews.find(r => r.paper_trade_id === t.id)?.emotion_state === 'anxious' || reviews.find(r => r.paper_trade_id === t.id)?.emotion_state === 'fearful')
  const greedyTrades = closedTrades.filter(t => reviews.find(r => r.paper_trade_id === t.id)?.emotion_state === 'greedy')

  data.psychology.calm_win_rate = calmTrades.length > 0 ? (calmTrades.filter(t => (t.result_pnl || 0) > 0).length / calmTrades.length) * 100 : 0
  data.psychology.anxious_win_rate = anxiousTrades.length > 0 ? (anxiousTrades.filter(t => (t.result_pnl || 0) > 0).length / anxiousTrades.length) * 100 : 0
  data.psychology.greedy_win_rate = greedyTrades.length > 0 ? (greedyTrades.filter(t => (t.result_pnl || 0) > 0).length / greedyTrades.length) * 100 : 0

  // --- Market Fit ---
  // Assuming deals have regime_label
  const riskOnTrades = closedTrades.filter(t => t.deal?.regime_label === 'risk-on')
  const riskOffTrades = closedTrades.filter(t => t.deal?.regime_label === 'risk-off')
  const highVolTrades = closedTrades.filter(t => t.deal?.regime_label === 'high-vol-caution')

  data.market_fit.risk_on_win_rate = riskOnTrades.length > 0 ? (riskOnTrades.filter(t => (t.result_pnl || 0) > 0).length / riskOnTrades.length) * 100 : 0
  data.market_fit.risk_off_win_rate = riskOffTrades.length > 0 ? (riskOffTrades.filter(t => (t.result_pnl || 0) > 0).length / riskOffTrades.length) * 100 : 0
  data.market_fit.high_vol_win_rate = highVolTrades.length > 0 ? (highVolTrades.filter(t => (t.result_pnl || 0) > 0).length / highVolTrades.length) * 100 : 0

  // Generate basic insights based on above stats
  if (data.performance.win_rate > 60) {
    data.insights.push({
      category: 'performance',
      title: '安定した勝率を維持',
      suggestion: '現在の戦略が相場にフィットしています。ロットサイズの微増を検討しても良いかもしれません。',
      severity: 'positive'
    })
  }

  if (anxiousTrades.length > calmTrades.length) {
    data.insights.push({
      category: 'psychology',
      title: '不安状態での取引が多いです',
      suggestion: 'トレード前に一呼吸置くか、見送り（スキップ）を選択して感情をリセットしましょう。',
      severity: 'negative'
    })
  }

  if (data.behavior.early_exit_rate > 50) {
    data.insights.push({
      category: 'behavior',
      title: 'チキン利食いが発生しがちです',
      suggestion: '事前に設定したターゲットまで我慢するか、部分利確を取り入れて利益を伸ばしましょう。',
      severity: 'warning'
    })
  } else if (data.behavior.rule_compliance_rate < 50) {
    data.insights.push({
      category: 'behavior',
      title: 'ルール逸脱が目立ちます',
      suggestion: '決めたルール通りに動けていないようです。ロットを下げるか一度取引をお休みしましょう。',
      severity: 'negative'
    })
  }

  return data
}
