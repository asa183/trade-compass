import { NextResponse } from 'next/server'
import { generateMarketRegime, generateDeals } from '@/lib/ai-engine'

// CRON job endpoint to update market regime and deals
// Can be called via Vercel Cron, Render Cron, or GitHub Actions
// Protected by CRON_SECRET environment variable
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cron job started: Generating market regime...')
    const regime = await generateMarketRegime()

    console.log('Cron job step 2: Generating deals...')
    const deals = await generateDeals()

    console.log('Cron job completed successfully.')
    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      regimeId: regime.id,
      dealsCount: deals.length 
    })
  } catch (error) {
    console.error('Cron API Error:', error)
    return NextResponse.json({ error: 'Failed to execute cron tasks' }, { status: 500 })
  }
}
