import { NextResponse } from 'next/server'
import { generateDeals } from '@/lib/ai-engine'

export const revalidate = 3600 // 1時間キャッシュ（APIコールの節約）

export async function GET() {
  try {
    const deals = await generateDeals()
    return NextResponse.json({ deals })
  } catch (error) {
    console.error('Deals API Error:', error)
    return NextResponse.json({ error: 'Failed to generate deals' }, { status: 500 })
  }
}
