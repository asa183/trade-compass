// ============================================================
// Trade Compass — Core Types
// ============================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'very-high'
export type SizeRecommendation = 'skip' | 'paper' | 'small' | 'standard'
export type EmotionState = 'calm' | 'anxious' | 'excited' | 'fearful' | 'greedy'
export type ReviewType = 'light' | 'standard' | 'weekly'
export type DealStatus = 'active' | 'expired' | 'triggered' | 'closed'
export type TradeStatus = 'open' | 'closed' | 'cancelled'
export type NotificationType = 'instant' | 'important' | 'scheduled'
export type BasketCategory = 'core-index' | 'style' | 'sector' | 'defensive'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

// ------ Market Regime ------
export type RegimeLabel =
  | 'risk-on'
  | 'risk-off'
  | 'rate-decline-tailwind'
  | 'rate-rise-headwind'
  | 'slowdown-caution'
  | 'overheat-caution'
  | 'rebound-early'
  | 'trend-continue'
  | 'high-vol-caution'

export interface MarketSnapshot {
  id: string
  timestamp: string
  sp500: number
  sp500_change_pct: number
  nasdaq100: number
  nasdaq100_change_pct: number
  russell2000: number
  russell2000_change_pct: number
  vix: number
  us10y_yield: number
  dxy: number
  crude_oil: number
  sp500_200ma_distance_pct: number
  sp500_50ma_distance_pct: number
  sector_performance: Record<string, number>
  news?: { uuid: string; title: string; publisher: string; link: string; providerPublishTime: number }[]
}

export interface MarketRegime {
  id: string
  snapshot_id: string
  label: RegimeLabel
  label_ja: string
  score_tailwind: number // 0-100
  score_risk: number     // 0-100
  score_heat: number     // 0-100
  score_trend: number    // 0-100
  score_timing: number   // 0-100
  summary_text: string
  tailwind_factors: string[]
  headwind_factors: string[]
  watch_points: string[]
  calculated_at: string
}

// ------ Market Events ------
export type EventType = 'cpi' | 'fomc' | 'jobs' | 'pce' | 'earnings' | 'options-expiry' | 'other'

export interface MarketEvent {
  id: string
  event_type: EventType
  label: string
  scheduled_at: string
  importance: 'high' | 'medium' | 'low'
  is_completed: boolean
  expected_value?: string
  actual_value?: string
  note?: string
}

// ------ User ------
export interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  created_at: string
}

export interface UserBehaviorProfile {
  user_id: string
  experience_level: ExperienceLevel
  hold_period: 'day' | 'swing' | 'mid' | 'long'    // 1日 / 数日〜2週 / 1〜3ヶ月 / 長期
  risk_tolerance: 'very-low' | 'low' | 'medium' | 'high'
  profit_taking_style: 'early' | 'rule-based' | 'patient' | 'let-run'
  investment_goal: 'growth' | 'income' | 'preservation' | 'learning'
  anxiety_triggers: string[]  // 'big-drop', 'night-move', 'news', ...
  interest_areas: string[]    // 'tech', 'etf', 'dividend', ...
  // derived from behavior
  high_vol_tolerance: number  // 0-100
  overnight_tolerance: number // 0-100
  skip_tendency: number       // 0-100 (高いほど見送り傾向)
  notification_follow_rate: number // 0-100
  rule_compliance_rate: number     // 0-100  追加
  // failure patterns
  failure_patterns: FailurePattern[]
}

export type FailurePattern =
  | 'buy-at-top'
  | 'panic-sell'
  | 'late-stop-loss'
  | 'early-profit-taking'
  | 'fomo-chase'

// ------ Basket ------
export interface Basket {
  id: string
  name: string
  name_ja: string
  category: BasketCategory
  style: string
  background_logic: string
  strategy_name: string
  strategy_name_ja: string
  etfs: ETFInfo[]
  entry_condition: string
  exit_take_profit: string
  exit_stop_loss: string
  skip_condition: string
  invalidation_condition: string
  hold_period_days: string
  tailwind_factors: string[]
  headwind_factors: string[]
  similar_period_comment: string
  risk_level: RiskLevel
}

export interface ETFInfo {
  ticker: string
  name: string
  description: string
}

export interface BasketRecommendation {
  id: string
  basket: Basket
  regime_id: string
  priority: number    // 1 = highest
  reason_text: string
  valid_until: string
}

// ------ Execution Fit Assessment ------
export interface ExecutionFitAssessment {
  id: string
  user_id: string
  deal_id: string
  market_fit_score: number   // 0-100
  user_fit_score: number     // 0-100
  size_recommendation: SizeRecommendation
  fit_reasons: string[]
  concern_factors: string[]
  summary_text: string
  assessed_at: string
}

// ------ Deal ------
export interface Deal {
  id: string
  basket_id: string
  basket: Basket
  name: string
  name_ja: string
  target_etfs: ETFInfo[]
  regime_label: RegimeLabel
  recommendation_level?: 'S' | 'A' | 'B' | 'C'
  recommendation_rationale?: string
  recommended_action: string   // 推奨行動テキスト
  entry_condition: string
  take_profit_line: string
  stop_loss_line: string
  invalidation_condition: string
  hold_period_days: string
  risk_level: RiskLevel
  confidence_score: number
  score_breakdown?: {
    regimeFit: number
    trend: number
    volatilityRisk: number
  }
  counter_scenario: string     // 反対シナリオ
  similar_past_case: string    // 類似過去ケース
  event_caution_note?: string  // イベント前注意
  execution_fit?: ExecutionFitAssessment
  generated_at: string
  valid_until: string
  status: DealStatus
}

// ------ Paper Trade ------
export interface PaperTrade {
  id: string
  user_id: string
  deal_id: string
  deal: Deal
  entry_price: number
  entry_date: string
  virtual_amount: number  // JPY
  lot_size: number
  exit_price?: number
  exit_date?: string
  exit_reason?: 'take-profit' | 'stop-loss' | 'manual' | 'expired'
  result_pnl?: number
  result_pct?: number
  status: TradeStatus
  rule_followed?: boolean
  emotion_state_entry?: EmotionState
  emotion_state_exit?: EmotionState
  max_drawdown?: number
  max_unrealized_gain?: number
}

// ------ Reviews ------
export interface DealReview {
  id: string
  paper_trade_id: string
  user_id: string
  review_type: ReviewType
  // Light review (20 sec)
  executed: boolean
  satisfaction_score: number  // 1-5
  emotion_state: EmotionState
  rule_followed: boolean
  // Standard review (1 min)
  skip_reason?: string
  fear_level?: number    // 1-5
  greed_level?: number   // 1-5
  deviation_notes?: string
  improvement_memo?: string
  reviewed_at: string
}

export interface SkipReview {
  id: string
  user_id: string
  deal_id: string
  skip_reason: string
  was_valid?: boolean
  outcome_after_skip?: string
  reviewed_at?: string
}

// ------ Notification ------
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  action_label?: string
  action_url?: string
  is_read: boolean
  created_at: string
}

// ------ Data Freshness ------
export interface DataFreshnessStatus {
  scope: 'market' | 'deals'
  last_updated_at: string
  next_expected_update_at: string
  label: 'fresh' | 'stale' | 'error'
}

// ------ Dashboard ------
export interface DashboardInsight {
  category: 'performance' | 'behavior' | 'psychology' | 'market-fit'
  title: string
  suggestion: string
  severity: 'positive' | 'neutral' | 'warning'
}

export interface PerformanceStats {
  total_pnl: number
  total_pnl_pct: number
  win_rate: number
  avg_win: number
  avg_loss: number
  risk_reward: number
  expectancy: number
  max_drawdown: number
  trade_count: number
}

export interface BehaviorStats {
  rule_compliance_rate: number
  notification_follow_rate: number
  skip_rate: number
  fomo_chase_rate: number
  early_exit_rate: number
  late_stop_rate: number
}

// ------ Onboarding ------
export interface OnboardingAnswers {
  experience_level: ExperienceLevel
  hold_period: UserBehaviorProfile['hold_period']
  risk_tolerance: UserBehaviorProfile['risk_tolerance']
  profit_taking_style: UserBehaviorProfile['profit_taking_style']
  investment_goal: UserBehaviorProfile['investment_goal']
  anxiety_triggers: string[]
  interest_areas: string[]
}
