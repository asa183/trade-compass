import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET() {
  try {
    const tickers = ['^GSPC', '^IXIC', '^RUT', '^VIX', '^TNX', 'DX-Y.NYB', 'CL=F']
    const quotes = (await yahooFinance.quote(tickers)) as any[]

    const findQuote = (symbol: string) => quotes.find((q: any) => q.symbol === symbol)

    const sp500 = findQuote('^GSPC')
    const nasdaq = findQuote('^IXIC')
    const russell = findQuote('^RUT')
    const vix = findQuote('^VIX')
    const tnX = findQuote('^TNX')
    const dxy = findQuote('DX-Y.NYB') // DXY
    const crude = findQuote('CL=F')

    // 一部のデータ（市場内部指標やセクター強度）はYahoo APIだけでは取得が難しいため、固定のダミー値をフォールバックとして使用します。
    // 将来的に他の専門API（TradingViewやAlpha Vantageなど）と連携して拡充できます。
    const marketSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      
      // 主要指数
      sp500: sp500?.regularMarketPrice ?? 5000,
      sp500_change_pct: sp500?.regularMarketChangePercent ?? 0,
      
      nasdaq100: nasdaq?.regularMarketPrice ?? 18000,
      nasdaq100_change_pct: nasdaq?.regularMarketChangePercent ?? 0,
      
      russell2000: russell?.regularMarketPrice ?? 2000,
      russell2000_change_pct: russell?.regularMarketChangePercent ?? 0,
      
      // マクロ指標
      vix: vix?.regularMarketPrice ?? 15,
      us10y_yield: tnX?.regularMarketPrice ?? 4.0, // ^TNX は %そのまま
      dxy: dxy?.regularMarketPrice ?? 103,
      crude_oil: crude?.regularMarketPrice ?? 75,
      
      // 以下はダミー固定値（市場内部指標）
      above_200ma_ratio: 65,
      new_52w_high_count: 120,
      credit_spread: 1.15,
      sector_strength: {
        technology: 80,
        healthcare: 55,
        energy: 60,
        financials: 65,
        consumer_staples: 45,
        utilities: 40,
        semiconductors: 85,
        real_estate: 38,
      },
    }

    return NextResponse.json({ snapshot: marketSnapshot })
  } catch (error) {
    console.error('Yahoo Finance API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
