'use server'

import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

/* ========================================================
   ダッシュボードの示唆生成 (gpt-4o-mini 使用)
======================================================== */
export async function generateDashboardInsights(dashboardData: any) {
  // 環境変数が設定されていない場合のフェールセーフ
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  // AIに渡すプロンプトを作成（データをJSON化）
  const prompt = `
  あなたはプロのトレードコーチです。
  以下のユーザーの直近のダッシュボードデータ（勝率、感情別の成績、ルールの遵守度など）を分析し、
  来週に向けた具体的な改善の示唆を3つ生成してください。

  出力は必ずJSON形式で、以下のスキーマに従ってください：
  - category: 改善のカテゴリ（例: "心理", "リスク管理", "ルール遵守"）
  - title: 短い的確なタイトル（例: "不安時のディール削減"）
  - suggestion: 具体的な行動提案（100文字程度）
  - severity: "positive" (良い傾向), "neutral" (通常), "warning" (警告・要改善)

  【データ】
  ${JSON.stringify(dashboardData, null, 2)}
  `

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({
      insights: z.array(
        z.object({
          category: z.string(),
          title: z.string(),
          suggestion: z.string(),
          severity: z.enum(['positive', 'neutral', 'warning']),
        })
      ).max(3),
    }),
    prompt,
  })

  return object.insights
}

/* ========================================================
   トレードメモの感情・ルール解析 (o3-mini 使用)
======================================================== */
export async function analyzeTradeMemo(memo: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const prompt = `
  あなたはプロのトレード心理アナリストです。
  以下のトレード後の振り返りメモを分析し、ユーザーの心理状態やルールの遵守具合を判定してください。
  深く思考し、文面から隠れた傾向（焦り、飛び乗り、後悔、冷静さ）を読み取ってください。

  【ユーザーのメモ】
  "${memo}"
  `

  const { object } = await generateObject({
    model: openai('o3-mini'),
    schema: z.object({
      emotion: z.enum(['calm', 'anxious', 'greedy', 'excited']).describe('メモから読み取れる主な感情'),
      fomoDetected: z.boolean().describe('飛び乗り（FOMO）の傾向が見られるか'),
      ruleFollowed: z.boolean().describe('全体として自身のルールを踏まえた行動だったと読み取れるか'),
      analysis: z.string().describe('なぜそう判断したか、プロのコーチとしての短いフィードバック（100文字程度）'),
    }),
    prompt,
  })

  return object
}
