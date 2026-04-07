import { NextResponse } from 'next/server'
import { generateMarketRegime } from '@/lib/engine'
import { getMarketSnapshot } from '@/lib/market'

export const revalidate = 3600 // 1時間キャッシュ（APIコールの節約）

export async function GET() {
  try {
    const fullRegime = await generateMarketRegime()
    const snapshot = await getMarketSnapshot() // 内部でキャッシュされている（もしくは同時に走る）
    return NextResponse.json({ regime: fullRegime, snapshot })
  } catch (error) {
    console.error('Regime API Error:', error)
    return NextResponse.json({ error: 'Failed to generate market regime' }, { status: 500 })
  }
}
