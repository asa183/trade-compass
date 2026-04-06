import {
  MarketSnapshot,
  MarketRegime,
  RegimeLabel,
  UserBehaviorProfile,
  Deal,
  Basket,
  ExecutionFitAssessment,
  SizeRecommendation,
  BasketRecommendation,
} from '@/types'

// ============================================================
// 1. 市場レジーム判定エンジン
// ============================================================

export function calcMarketRegime(snap: MarketSnapshot): Omit<MarketRegime, 'id' | 'snapshot_id'> {
  const { vix, us10y_yield, sp500, above_200ma_ratio, credit_spread } = snap

  // ---- スコア計算 ----
  // 追い風スコア: 低VIX + 低金利 + 強い市場内部
  const tailwindVix = vix < 15 ? 80 : vix < 20 ? 60 : vix < 25 ? 35 : 10
  const tailwindRate = us10y_yield < 3.5 ? 85 : us10y_yield < 4.0 ? 70 : us10y_yield < 4.5 ? 45 : 20
  const tailwindInternal = above_200ma_ratio > 70 ? 80 : above_200ma_ratio > 55 ? 60 : above_200ma_ratio > 40 ? 35 : 15
  const score_tailwind = Math.round((tailwindVix + tailwindRate + tailwindInternal) / 3)

  // リスクスコア: 高VIX + クレジットスプレッド拡大
  const riskVix = vix > 30 ? 85 : vix > 22 ? 60 : vix > 17 ? 35 : 15
  const riskSpread = credit_spread > 2.0 ? 80 : credit_spread > 1.5 ? 55 : credit_spread > 1.2 ? 35 : 15
  const score_risk = Math.round((riskVix + riskSpread) / 2)

  // 過熱スコア: 高い200MA上銘柄比率 + 52週高値更新増
  const heat52w = snap.new_52w_high_count > 300 ? 80 : snap.new_52w_high_count > 200 ? 65 : snap.new_52w_high_count > 100 ? 45 : 25
  const heatInternal = above_200ma_ratio > 80 ? 75 : above_200ma_ratio > 70 ? 58 : above_200ma_ratio > 55 ? 40 : 20
  const score_heat = Math.round((heat52w + heatInternal) / 2)

  // トレンドスコア: SP500 vs 200MA
  const trendScore = above_200ma_ratio > 65 ? 75 : above_200ma_ratio > 50 ? 55 : above_200ma_ratio > 35 ? 35 : 15
  const score_trend = Math.round(trendScore + (snap.sp500_change_pct > 0 ? 10 : -10))

  // タイミングスコア: 複合
  const score_timing = Math.round(
    score_tailwind * 0.4 + (100 - score_risk) * 0.3 + (100 - score_heat) * 0.3
  )

  // ---- レジームラベル判定 ----
  let label: RegimeLabel
  let label_ja: string

  if (vix > 28) {
    label = 'high-vol-caution'
    label_ja = '高ボラ注意'
  } else if (above_200ma_ratio < 40 && snap.sp500_change_pct < -1) {
    label = 'risk-off'
    label_ja = 'リスクオフ'
  } else if (us10y_yield < 3.8 && score_tailwind > 65) {
    label = 'rate-decline-tailwind'
    label_ja = '金利低下追い風'
  } else if (us10y_yield > 4.5) {
    label = 'rate-rise-headwind'
    label_ja = '金利上昇逆風'
  } else if (score_tailwind > 68 && score_risk < 35) {
    label = 'risk-on'
    label_ja = 'リスクオン'
  } else if (score_heat > 70) {
    label = 'overheat-caution'
    label_ja = '過熱警戒'
  } else if (snap.sp500_change_pct > 0 && above_200ma_ratio > 55) {
    label = 'trend-continue'
    label_ja = 'トレンド継続'
  } else if (snap.sp500_change_pct > -1 && above_200ma_ratio > 45) {
    label = 'rebound-early'
    label_ja = '反発初動'
  } else {
    label = 'slowdown-caution'
    label_ja = '景気減速警戒'
  }

  // ---- 自然言語生成 ----
  const tailwind_factors: string[] = []
  const headwind_factors: string[] = []
  const watch_points: string[] = []

  if (us10y_yield < 4.0) tailwind_factors.push(`金利低下（${us10y_yield}%）で成長株に追い風`)
  if (vix < 18) tailwind_factors.push(`VIX${vix}台で急変リスクは低め`)
  if (above_200ma_ratio > 60) tailwind_factors.push(`市場内部健全（200MA上 ${above_200ma_ratio}%）`)
  if (snap.nasdaq100_change_pct > 0.5) tailwind_factors.push('Nasdaq100が相対強い')

  if (us10y_yield > 4.2) headwind_factors.push(`金利水準がやや高く（${us10y_yield}%）、グロース株に逆風`)
  if (vix > 20) headwind_factors.push(`VIX${vix}台まで上昇、ボラ拡大に注意`)
  if (credit_spread > 1.3) headwind_factors.push('クレジットスプレッド拡大、信用不安の兆し')
  if (score_heat > 55) headwind_factors.push('過熱感あり、新規エントリーは慎重に')

  watch_points.push(`次の重要指標: CPI・FOMC・雇用統計の前後は値動きに注意`)
  if (snap.russell2000_change_pct < snap.sp500_change_pct - 1) {
    watch_points.push('小型株（Russell2000）の戻りが弱い。市場内部のリスクを確認')
  }

  const summaryParts: string[] = []
  if (tailwind_factors.length > 0) summaryParts.push(tailwind_factors[0])
  if (headwind_factors.length > 0) summaryParts.push(`ただし${headwind_factors[0]}`)
  const summary_text = summaryParts.join('。') + '。'

  return {
    label,
    label_ja,
    score_tailwind: Math.min(100, Math.max(0, score_tailwind)),
    score_risk: Math.min(100, Math.max(0, score_risk)),
    score_heat: Math.min(100, Math.max(0, score_heat)),
    score_trend: Math.min(100, Math.max(0, score_trend)),
    score_timing: Math.min(100, Math.max(0, score_timing)),
    summary_text,
    tailwind_factors,
    headwind_factors,
    watch_points,
    calculated_at: new Date().toISOString(),
  }
}

// ============================================================
// 2. バスケット選定エンジン
// ============================================================

export function selectBaskets(
  regime: Pick<MarketRegime, 'label' | 'score_tailwind' | 'score_risk' | 'score_heat'>,
  profile: UserBehaviorProfile,
  allBaskets: Basket[]
): BasketRecommendation[] {
  const { label, score_tailwind, score_risk, score_heat } = regime

  // バスケットスコアリング
  const scored = allBaskets.map((basket) => {
    let score = 50 // ベーススコア

    // レジームマッチ
    if (label === 'risk-on' || label === 'rate-decline-tailwind') {
      if (basket.category === 'core-index' || basket.category === 'sector') score += 25
      if (basket.category === 'defensive') score -= 15
    } else if (label === 'risk-off' || label === 'high-vol-caution') {
      if (basket.category === 'defensive') score += 30
      if (basket.category === 'sector') score -= 20
    } else if (label === 'rate-rise-headwind') {
      if (basket.style.includes('高配当') || basket.category === 'defensive') score += 20
      if (basket.name.includes('Growth') || basket.category === 'sector') score -= 15
    }

    // ユーザー適合
    if (profile.risk_tolerance === 'low' || profile.risk_tolerance === 'very-low') {
      if (basket.risk_level === 'low') score += 15
      if (basket.risk_level === 'high' || basket.risk_level === 'very-high') score -= 20
    }
    if (profile.interest_areas.includes('tech') && basket.category === 'sector') score += 10
    if (profile.interest_areas.includes('etf') && basket.category === 'core-index') score += 8

    // 過熱補正
    if (score_heat > 65 && basket.risk_level !== 'low') score -= 10

    // リスク補正
    if (score_risk > 55 && basket.risk_level === 'high') score -= 15

    const reason = buildBasketReason(basket, regime, profile)
    return { basket, score, reason }
  })

  // ソートして上位3件
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map((item, idx) => ({
    id: `rec-${item.basket.id}`,
    basket: item.basket,
    regime_id: 'regime-current',
    priority: idx + 1,
    reason_text: item.reason,
    valid_until: new Date(Date.now() + 86400000).toISOString(),
  }))
}

function buildBasketReason(
  basket: Basket,
  regime: Pick<MarketRegime, 'label'>,
  profile: UserBehaviorProfile
): string {
  const parts: string[] = []
  if (regime.label === 'rate-decline-tailwind' && basket.tailwind_factors.length > 0) {
    parts.push(basket.tailwind_factors[0])
  }
  if (profile.risk_tolerance === 'medium' && basket.risk_level === 'medium') {
    parts.push('あなたのリスク許容度に合致')
  }
  if (basket.confidence_score > 70) {
    parts.push(`確信度${basket.confidence_score}%と高め`)
  }
  return parts.join('。') || basket.background_logic.slice(0, 60) + '…'
}

// ============================================================
// 3. 実行適合判定レイヤー（最重要）
// ============================================================

export function assessExecutionFit(
  deal: Deal,
  profile: UserBehaviorProfile,
  recentTrades: { rule_followed: boolean; emotion_state_entry: string }[],
  hasHighVolEvent: boolean,
  currentVix: number
): ExecutionFitAssessment {
  const concerns: string[] = []
  const fits: string[] = []
  let marketFit = 70
  let userFit = 70

  // ---- 市場適合 ----
  if (deal.confidence_score >= 70) {
    fits.push('確信度が高い（70%以上）')
    marketFit += 8
  } else {
    concerns.push('確信度がやや低め（70%未満）')
    marketFit -= 10
  }

  if (hasHighVolEvent) {
    concerns.push('重要イベント前で値動きが荒くなりやすい')
    marketFit -= 15
  }

  if (currentVix > 22) {
    concerns.push(`VIX${currentVix}台で高ボラ環境`)
    marketFit -= 12
  } else {
    fits.push(`VIX${currentVix}台で市場は比較的安定`)
  }

  // ---- ユーザー適合 ----
  // 高ボラ耐性チェック
  if (deal.risk_level === 'high' && profile.high_vol_tolerance < 50) {
    concerns.push('あなたの高ボラ耐性が低め。この種のディールで成績が不安定な傾向')
    userFit -= 20
  }

  // 夜間耐性チェック
  if (hasHighVolEvent && profile.overnight_tolerance < 60) {
    concerns.push('夜間イベントへの耐性が低め。イベント通過後のエントリーを推奨')
    userFit -= 15
  }

  // 失敗パターンチェック
  if (profile.failure_patterns.includes('fomo-chase') && deal.status === 'active') {
    concerns.push('過去に飛び乗りで成績が悪化したパターンあり。条件を厳格に確認して')
    userFit -= 10
  }
  if (profile.failure_patterns.includes('early-profit-taking')) {
    concerns.push('利確が早い傾向。目標ラインを事前に決めてから実行を')
    userFit -= 5
  }

  // ルール遵守率チェック
  const recentCompliance = recentTrades.length > 0
    ? recentTrades.filter(t => t.rule_followed).length / recentTrades.length * 100
    : profile.rule_compliance_rate
  if (recentCompliance < 60) {
    concerns.push(`直近のルール遵守率が${Math.round(recentCompliance)}%と低め。実運用前に改善を`)
    userFit -= 15
  } else {
    fits.push(`ルール遵守率${Math.round(recentCompliance)}%は良好`)
  }

  // ---- サイズ推奨 ----
  const finalMarket = Math.min(100, Math.max(0, marketFit))
  const finalUser = Math.min(100, Math.max(0, userFit))
  let size: SizeRecommendation

  if (finalMarket < 45 || finalUser < 40) {
    size = 'skip'
  } else if (finalMarket < 58 || finalUser < 55 || hasHighVolEvent) {
    size = 'paper'
  } else if (finalMarket < 72 || finalUser < 65) {
    size = 'small'
  } else {
    size = 'standard'
  }

  // ---- サマリーテキスト ----
  let summary: string
  if (size === 'skip') {
    summary = '現時点では見送りが有力です。市場条件またはあなたの適合度が低め。条件が整うまで待ちましょう。'
  } else if (size === 'paper') {
    summary = '市場には条件がそろいつつありますが、今のあなたのコンディションでは模擬ディールからの確認が安心です。'
  } else if (size === 'small') {
    summary = '条件がそろっています。ただし、注意すべき点があるため、まずは小さめのサイズからの実行を推奨します。'
  } else {
    summary = '市場条件・あなたへの適合性ともに良好です。ルールに従って実行できるタイミングです。'
  }

  return {
    id: `fit-${deal.id}`,
    user_id: profile.user_id,
    deal_id: deal.id,
    market_fit_score: finalMarket,
    user_fit_score: finalUser,
    size_recommendation: size,
    fit_reasons: fits,
    concern_factors: concerns,
    summary_text: summary,
    assessed_at: new Date().toISOString(),
  }
}

// ============================================================
// 4. 見送り評価ロジック
// ============================================================

export function evaluateSkip(
  skipReason: string,
  dealOutcomePct?: number
): { was_valid: boolean; verdict: string; message: string } {
  const validReasons = ['event-before', 'vix-high', 'rule-not-met', 'size-risk', 'low-confidence']
  const isReasonValid = validReasons.some(r => skipReason.includes(r))

  if (dealOutcomePct === undefined) {
    return {
      was_valid: true,
      verdict: 'pending',
      message: 'まだ結果が出ていません。見送りの判断を後で評価します。',
    }
  }

  if (dealOutcomePct < -3) {
    return {
      was_valid: true,
      verdict: 'good',
      message: `見送りは妥当でした。${Math.abs(dealOutcomePct).toFixed(1)}%の下落を回避できています。`,
    }
  } else if (dealOutcomePct > 5) {
    return {
      was_valid: false,
      verdict: 'missed',
      message: `見送ったディールは${dealOutcomePct.toFixed(1)}%上昇しました。次回は見送り条件を見直してみましょう。ただし、結果だけで判断を責める必要はありません。`,
    }
  } else {
    return {
      was_valid: isReasonValid,
      verdict: 'neutral',
      message: '結果は小動きでした。見送り判断の妥当性は判定が難しいです。根拠があれば十分です。',
    }
  }
}

// ============================================================
// 5. ダッシュボード示唆生成
// ============================================================

export function generateInsights(
  behavior: { rule_compliance_rate: number; early_exit_rate: number; fomo_chase_rate: number },
  performance: { win_rate: number; avg_win: number; avg_loss: number }
): Array<{ title: string; suggestion: string; severity: 'positive' | 'neutral' | 'warning' }> {
  const insights = []

  if (behavior.rule_compliance_rate < 70) {
    insights.push({
      title: `ルール遵守率が${behavior.rule_compliance_rate}%です`,
      suggestion: '目標ラインを事前にメモする習慣を作ると、ルール遵守率が改善する傾向があります。',
      severity: 'warning' as const,
    })
  } else {
    insights.push({
      title: `ルール遵守率が${behavior.rule_compliance_rate}%と良好です`,
      suggestion: 'ルール通りの判断は、長期的な成績安定に直結しています。この調子で続けましょう。',
      severity: 'positive' as const,
    })
  }

  if (behavior.early_exit_rate > 30) {
    insights.push({
      title: `利確が早い傾向があります（早期撤退率${behavior.early_exit_rate}%）`,
      suggestion: '目標ラインを設定せずに感覚で利確しているケースが多い可能性があります。目標ラインを事前に決めましょう。',
      severity: 'warning' as const,
    })
  }

  if (behavior.fomo_chase_rate > 20) {
    insights.push({
      title: `飛び乗り傾向が見られます（${behavior.fomo_chase_rate}%）`,
      suggestion: 'すでに大きく上がった後のエントリーは、リスクリワードが悪化します。次回は条件を冷静に確認してから。',
      severity: 'warning' as const,
    })
  }

  if (performance.win_rate > 60) {
    insights.push({
      title: `勝率${performance.win_rate}%は良好な水準です`,
      suggestion: '次のステップは、勝ちの平均利益をさらに伸ばすことです。早期利確を減らすことで改善できます。',
      severity: 'positive' as const,
    })
  }

  return insights
}
