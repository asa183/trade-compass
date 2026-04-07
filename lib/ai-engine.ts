import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { getMarketSnapshot } from './market'

export async function generateMarketRegime() {
  const snapshot = await getMarketSnapshot()
  
  const { object: regime } = await generateObject({
    model: openai('o3-mini'),
    schema: z.object({
      label: z.enum(['risk-on', 'risk-off', 'rate-decline-tailwind', 'inflation-scare', 'neutral']),
      label_ja: z.string(),
      score_tailwind: z.number().min(0).max(100),
      score_risk: z.number().min(0).max(100),
      score_heat: z.number().min(0).max(100),
      score_trend: z.number().min(0).max(100),
      score_timing: z.number().min(0).max(100),
      summary_text: z.string(),
      tailwind_factors: z.array(z.string()),
      headwind_factors: z.array(z.string()),
      watch_points: z.array(z.string())
    }),
    prompt: `あなたは熟練の機関投資家・マーケットアナリストです。
以下の現在の市場データとニュースヘッドラインを分析し、現在の市場レジーム（相場環境）を判定し、日本語で出力してください。
各スコアは0〜100の範囲で評価してください。VIXが高い場合はscore_riskを高めに設定するなどの一般的な法則に従ってください。

Data:
- S&P500: ${snapshot.sp500} (前日比: ${snapshot.sp500_change_pct}%)
- Nasdaq100: ${snapshot.nasdaq100} (前日比: ${snapshot.nasdaq100_change_pct}%)
- US 10年債利回り: ${snapshot.us10y_yield}%
- VIX: ${snapshot.vix}
- DXY: ${snapshot.dxy}
- 原油 WTI: ${snapshot.crude_oil}
- ニュース: ${snapshot.news.map((n: any) => n.title).join(' / ')}
`
  })

  return {
    id: `regime-${Date.now()}`,
    snapshot_id: snapshot.id,
    calculated_at: new Date().toISOString(),
    ...regime
  }
}

import { supabase } from './supabase'

export async function generateDeals() {
  const regime = await generateMarketRegime()
  
  const { data: baskets, error } = await supabase.from('baskets').select('*')
  if (error || !baskets) throw new Error('Failed to fetch baskets for AI engine')
  const slimBaskets = baskets.map(b => ({
    id: b.id,
    name: b.name,
    etfs: b.etfs.map((e: any) => e.ticker).join(', '),
    logic: b.background_logic
  }))

  const { object: deals } = await generateObject({
    model: openai('o3-mini'),
    schema: z.object({
      deals: z.array(z.object({
        basket_id: z.string(),
        name: z.string(),
        name_ja: z.string(),
        target_etfs: z.array(z.object({
          ticker: z.string(),
          name: z.string(),
          description: z.string()
        })),
        recommendation_level: z.enum(['S', 'A', 'B', 'C']),
        recommendation_rationale: z.string(),
        recommended_action: z.string(),
        entry_condition: z.string(),
        take_profit_line: z.string(),
        stop_loss_line: z.string(),
        invalidation_condition: z.string(),
        hold_period_days: z.string(),
        risk_level: z.enum(['low', 'medium', 'high']),
        score_breakdown: z.object({
          regimeFit: z.number().min(0).max(100).describe('現在の市場レジームとの適合度'),
          trend: z.number().min(0).max(100).describe('テーマやETFの現在のモメンタム'),
          volatilityRisk: z.number().min(0).max(100).describe('変動リスク・ドローダウン危険度(高いほど危険)')
        }),
        counter_scenario: z.string(),
        similar_past_case: z.string(),
        event_caution_note: z.string()
      })).max(5)
    }),
    prompt: `あなたは熟練の機関投資家・ストラテジストです。
現在の市場レジーム（相場環境）と利用可能なバスケット一覧から、今最も実行すべき投資推奨行動（ディール）を最大5つ選別し、具体的な売買プランを生成してください。
日本語で記述してください。各ディールには、おすすめ度（S, A, B, C）とその根拠（rationale）を含めてください。
確信度(confidence_score)は直接出力せず、score_breakdown (regimeFit, trend, volatilityRisk) の3要素をそれぞれ0〜100で厳格に評価してください。

現在のレジーム:
${JSON.stringify(regime, null, 2)}

利用可能なバスケット一覧 (軽量版):
${JSON.stringify(slimBaskets, null, 2)}

各ディールのbasket_idは、選んだバスケットのidと正確に一致させてください。
`
  })

  return deals.deals.map((d: any, index: number) => {
    // 総合正確信度を計算: Regime(40%) + Trend(40%) + RiskPenalty(20%)
    const regimeFit = d.score_breakdown.regimeFit
    const trend = d.score_breakdown.trend
    const risk = d.score_breakdown.volatilityRisk
    const confidence_score = Math.round(Math.min(100, Math.max(0, (regimeFit * 0.4) + (trend * 0.4) + ((100 - risk) * 0.2))))
    
    return {
      id: `deal-${Date.now()}-${index}`,
      regime_label: regime.label,
      generated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'active',
      confidence_score,
      ...d
    }
  })
}
