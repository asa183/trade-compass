import YahooFinance from 'yahoo-finance2'
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export async function getMarketSnapshot() {
  const tickers = ['^GSPC', '^IXIC', '^RUT', '^VIX', '^TNX', 'DX-Y.NYB', 'CL=F']
  const sectorTickers = ['XLK', 'XLV', 'XLE', 'XLF', 'XLP', 'XLU', 'SMH', 'XLRE']
  let quotesObj: any = []
  let sectorQuotesObj: any = []
  let newsResult: any = { news: [] }

  try {
    quotesObj = await yahooFinance.quote(tickers)
  } catch (e) { console.error('yahoo quote error', e) }

  try {
    sectorQuotesObj = await yahooFinance.quote(sectorTickers)
  } catch (e) { console.error('yahoo sector quote error', e) }

  try {
    newsResult = await yahooFinance.search('SPY', { newsCount: 5 })
  } catch (e) {}
  const quotes = quotesObj as any[]
  const sectorQuotes = sectorQuotesObj as any[]
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

  const calcDistance = (price?: number, ma?: number) => {
    if (!price || !ma) return 0
    return ((price / ma) - 1) * 100
  }

  const sp500_200ma_distance_pct = calcDistance(sp500?.regularMarketPrice, sp500?.twoHundredDayAverage)
  const sp500_50ma_distance_pct = calcDistance(sp500?.regularMarketPrice, sp500?.fiftyDayAverage)

  const sector_performance: Record<string, number> = {}
  for (const t of sectorTickers) {
    const q = sectorQuotes.find((sq: any) => sq.symbol === t)
    sector_performance[t] = calcDistance(q?.regularMarketPrice, q?.fiftyDayAverage)
  }

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
    sp500_200ma_distance_pct,
    sp500_50ma_distance_pct,
    sector_performance,
    news: marketNews
  }
}
