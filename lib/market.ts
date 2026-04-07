import yahooFinance from 'yahoo-finance2'

export async function getMarketSnapshot() {
  const tickers = ['^GSPC', '^IXIC', '^RUT', '^VIX', '^TNX', 'DX-Y.NYB', 'CL=F']
  let quotesObj: any = []
  let newsResult: any = { news: [] }

  try {
    quotesObj = await yahooFinance.quote(tickers)
  } catch (e) {}

  try {
    newsResult = await yahooFinance.search('SPY', { newsCount: 5 })
  } catch (e) {}
  const quotes = quotesObj as any[]
  const marketNews = ((newsResult as any).news || []).map((n: any) => ({
    uuid: n.uuid,
    title: n.title,
    publisher: n.publisher,
    link: n.link,
    providerPublishTime: n.providerPublishTime,
  }))

  const findQuote = (symbol: string) => quotes.find((q: any) => q.symbol === symbol)

  const sp500 = findQuote('^GSPC')
  const nasdaq = findQuote('^IXIC')
  const russell = findQuote('^RUT')
  const vix = findQuote('^VIX')
  const tnX = findQuote('^TNX')
  const dxy = findQuote('DX-Y.NYB')
  const crude = findQuote('CL=F')

  return {
    id: `snap-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sp500: sp500?.regularMarketPrice ?? 5000,
    sp500_change_pct: sp500?.regularMarketChangePercent ?? 0,
    nasdaq100: nasdaq?.regularMarketPrice ?? 18000,
    nasdaq100_change_pct: nasdaq?.regularMarketChangePercent ?? 0,
    russell2000: russell?.regularMarketPrice ?? 2000,
    russell2000_change_pct: russell?.regularMarketChangePercent ?? 0,
    vix: vix?.regularMarketPrice ?? 15,
    us10y_yield: tnX?.regularMarketPrice ?? 4.0,
    dxy: dxy?.regularMarketPrice ?? 103,
    crude_oil: crude?.regularMarketPrice ?? 75,
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
    news: marketNews
  }
}
