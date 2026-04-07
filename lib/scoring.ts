import { Basket, MarketRegime } from '@/types'

export interface DynamicScore {
  regimeFit: number
  trend: number
  volatilityRisk: number
  total: number
}

// レジームとバスケットカテゴリ/テーマの簡易的な適性マッピング
const REGIME_FIT_MAP: Record<string, string[]> = {
  'risk-on': ['AI・半導体', '成長株', 'ハイテク', 'sector'],
  'rate-decline-tailwind': ['中小型株', 'REIT', '公益事業'],
  'inflation-scare': ['エネルギー', 'コモディティ', '素材'],
  'risk-off': ['生活必需品', 'ヘルスケア', '金', 'defensive'],
  'neutral': ['コア指数', '高配当', 'core-index']
}

export function calculateDynamicBasketScore(basket: Basket, regime: MarketRegime | null): DynamicScore {
  if (!regime) {
    return { regimeFit: 50, trend: 50, volatilityRisk: 50, total: 50 }
  }

  // 1. Regime Fit Calculation
  let regimeFit = 50
  const preferredThemes = REGIME_FIT_MAP[regime.label] || []
  
  // カテゴリや名前に含まれているか簡易判定
  const isMatch = preferredThemes.some(theme => 
    basket.category === theme || 
    basket.name_ja.includes(theme) || 
    basket.background_logic.includes(theme) ||
    basket.etfs.some(e => e.description.includes(theme) || e.ticker.includes(theme))
  )
  
  if (isMatch) {
    regimeFit = 85 + Math.random() * 10 // 少し揺らぎをもたせる
  } else if (regime.label === 'risk-off' && basket.category !== 'defensive') {
    regimeFit = 30 + Math.random() * 10
  } else {
    regimeFit = 50 + Math.random() * 20
  }

  // 2. Trend Momentum Calculation (ダミー計算)
  // 実際にはETFの過去数日の価格データを引くなどの処理が入るが、ここではスコアを適当に算出
  const trend = 60 + Math.random() * 30

  // 3. Volatility Risk Calculation
  // risk_level に基づくベースライン
  const baseVol = {
    'low': 20,
    'medium': 40,
    'high': 70,
    'very-high': 90
  }[basket.risk_level] || 50
  
  // VIXが高い時はボラティリティリスクも引き上げ
  const regimeRiskMod = (regime.score_risk - 50) * 0.4
  const volatilityRisk = Math.min(100, Math.max(0, baseVol + regimeRiskMod))

  // 4. Total Score
  // 総正確信度 = (Regime Fit * 0.4) + (Trend * 0.4) - (Volatility Penalty * 0.2)
  let total = (regimeFit * 0.5) + (trend * 0.4) + ((100 - volatilityRisk) * 0.1)
  total = Math.round(Math.min(100, Math.max(0, total)))

  return {
    regimeFit: Math.round(regimeFit),
    trend: Math.round(trend),
    volatilityRisk: Math.round(volatilityRisk),
    total
  }
}
