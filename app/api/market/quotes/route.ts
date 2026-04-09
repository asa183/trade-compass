import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export const revalidate = 60 // 1分キャッシュ

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolsParam = searchParams.get('symbols')

  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 })
  }

  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  
  if (symbols.length === 0) {
    return NextResponse.json({ quotes: {} })
  }

  try {
    const quotesObj = await yahooFinance.quote(symbols)
    // format as a record: { "SPY": 450.12, "QQQ": 300.41 }
    const quotes: Record<string, { price: number; changePct: number }> = {}
    
    // yahooFinance.quote returns an array if multiple symbols, or single object if one symbol
    const quotesArray = Array.isArray(quotesObj) ? quotesObj : [quotesObj]
    
    for (const q of quotesArray as any[]) {
      if (q && q.symbol && q.regularMarketPrice) {
        quotes[q.symbol] = {
          price: q.regularMarketPrice,
          changePct: q.regularMarketChangePercent || 0
        }
      }
    }

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error('Quotes API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
