import { NextResponse } from 'next/server'
import { getMarketSnapshot } from '@/lib/market'

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const marketSnapshot = await getMarketSnapshot()
    return NextResponse.json({ snapshot: marketSnapshot })
  } catch (error) {
    console.error('Yahoo Finance API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
