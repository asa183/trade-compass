import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const basketsData = [
  // 1-10: Broad Market & Major Indexes
  { name: 'S&P 500 Core', name_ja: 'S&P 500 コア', category: 'core-index', style: 'large-cap', 
    etfs: [{ ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', description: 'S&P 500指数連動' }],
    background_logic: '米国経済全体の成長を捉える最も標準的なコア資産。' },
  { name: 'Nasdaq 100 Growth', name_ja: 'ナスダック100 グロース', category: 'core-index', style: 'large-cap', 
    etfs: [{ ticker: 'QQQ', name: 'Invesco QQQ Trust', description: 'ナスダック100指数連動' }],
    background_logic: '大型ハイテク企業を中心としたイノベーション主導の成長を狙う。' },
  { name: 'Dow Jones Blue Chip', name_ja: 'ダウ・ブルーチップ', category: 'core-index', style: 'large-cap', 
    etfs: [{ ticker: 'DIA', name: 'SPDR Dow Jones Industrial Average', description: 'ダウ工業株30種平均' }],
    background_logic: '歴史ある超大型優良企業に注目し、安定感のある値動きを志向。' },
  { name: 'Russell 2000 Small Cap', name_ja: 'ラッセル2000 小型株', category: 'core-index', style: 'small-cap', 
    etfs: [{ ticker: 'IWM', name: 'iShares Russell 2000 ETF', description: '小型株指標' }],
    background_logic: '金融緩和や米国経済のソフトランディング期待時に活気づく中小型株。' },
  { name: 'Total Stock Market', name_ja: '米国株式市場全体', category: 'core-index', style: 'all-cap', 
    etfs: [{ ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', description: '米国株式市場全体をカバー' }],
    background_logic: '大型から小型まで米国株全体のアウトパフォームを狙う。' },
  { name: 'S&P 500 Equal Weight', name_ja: 'S&P500 均等割付', category: 'core-index', style: 'mid-cap', 
    etfs: [{ ticker: 'RSP', name: 'Invesco S&P 500 Equal Weight ETF', description: '時価総額に依存しない均等配分' }],
    background_logic: '超大型テックへの過度な集中を避け、中型株の底上げを狙う。' },
  { name: 'Nasdaq 100 Equal Weight', name_ja: 'ナスダック100 均等割付', category: 'core-index', style: 'mid-cap', 
    etfs: [{ ticker: 'QQQE', name: 'Direxion NASDAQ-100 Equal Weighted', description: 'ナスダック100均等配分' }],
    background_logic: 'マグニフィセント・セブンに偏らないハイテクの中間層に投資。' },
  { name: 'Mega Cap Tech', name_ja: 'メガキャップ・テック', category: 'core-index', style: 'large-cap', 
    etfs: [{ ticker: 'MGK', name: 'Vanguard Mega Cap Growth ETF', description: '超大型グロース' }],
    background_logic: 'AIブームや高収益テック企業の強さに特化した上位寡占アプローチ。' },
  { name: 'Mid Cap Core', name_ja: 'ミッドキャップ・コア', category: 'core-index', style: 'mid-cap', 
    etfs: [{ ticker: 'VO', name: 'Vanguard Mid-Cap ETF', description: '中型株指標' }],
    background_logic: '成長リスクと安定性のバランスを取る中型企業群。' },
  { name: 'Micro Cap Growth', name_ja: 'マイクロキャップ爆発力', category: 'core-index', style: 'small-cap', 
    etfs: [{ ticker: 'IWC', name: 'iShares Micro-Cap ETF', description: '超小型株指標' }],
    background_logic: '流動性の回復局面で真っ先に跳ねる爆発力重視のマイクロキャップ。' },

  // 11-20: Sectors (The 11 GICS Sectors + Real Estate)
  { name: 'Technology Sector', name_ja: 'テクノロジー・セクター', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'XLK', name: 'Technology Select Sector SPDR', description: 'ソフトウェアとハードウェア' }],
    background_logic: '企業のIT投資やAIインフラ投資の恩恵を直接受ける。' },
  { name: 'Financial Sector', name_ja: '金融セクター', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'XLF', name: 'Financial Select Sector SPDR', description: '銀行と保険' }],
    background_logic: '金利上昇や経済のソフトランディングによる収益改善が期待される。' },
  { name: 'Health Care Sector', name_ja: 'ヘルスケア・セクター', category: 'sector', style: 'defensive', 
    etfs: [{ ticker: 'XLV', name: 'Health Care Select Sector SPDR', description: '医薬品・医療機器' }],
    background_logic: '景気変動に強く、高齢化による構造的な需要が下支え。' },
  { name: 'Consumer Discretionary', name_ja: '一般消費財セクター', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'XLY', name: 'Consumer Discretionary Select Sector SPDR', description: 'アマゾン、テスラ等' }],
    background_logic: '個人消費の強さやセンチメント回復時に強い。' },
  { name: 'Consumer Staples', name_ja: '生活必需品セクター', category: 'sector', style: 'defensive', 
    etfs: [{ ticker: 'XLP', name: 'Consumer Staples Select Sector SPDR', description: '食品・日用品' }],
    background_logic: 'インフレ下でも価格転嫁しやすく、景気後退時にもディフェンシブに機能。' },
  { name: 'Energy Sector', name_ja: 'エネルギー・セクター', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'XLE', name: 'Energy Select Sector SPDR', description: '石油・ガス' }],
    background_logic: '原油高や地政学リスクの高まりをヘッジし、高配当も享受。' },
  { name: 'Utilities Sector', name_ja: '公益セクター', category: 'sector', style: 'defensive', 
    etfs: [{ ticker: 'XLU', name: 'Utilities Select Sector SPDR', description: '電力・水道' }],
    background_logic: '典型的な安全資産。金利低下局面での配当利回りが魅力。' },
  { name: 'Industrial Sector', name_ja: '資本財セクター', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'XLI', name: 'Industrial Select Sector SPDR', description: '航空宇宙、機械' }],
    background_logic: 'インフラ投資や製造業のリショアリング（回帰）の恩恵。' },
  { name: 'Materials Sector', name_ja: '素材セクター', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'XLB', name: 'Materials Select Sector SPDR', description: '化学、鉱業' }],
    background_logic: 'コモディティサイクルの上昇およびインフレ耐性が特徴。' },
  { name: 'Real Estate Sector', name_ja: '不動産セクター', category: 'sector', style: 'yield', 
    etfs: [{ ticker: 'XLRE', name: 'Real Estate Select Sector SPDR', description: 'リート(REIT)' }],
    background_logic: '金利低下による資金調達コスト減と、高利回りの恩恵。' },

  // 21-30: Style & Factor
  { name: 'Dividend Aristocrats', name_ja: '配当貴族・インカム', category: 'style', style: 'yield', 
    etfs: [{ ticker: 'NOBL', name: 'ProShares S&P 500 Dividend Aristocrats', description: '25年以上連続増配' }],
    background_logic: '安定した財務基盤を持ち、下落相場に対する耐久性が高い。' },
  { name: 'High Dividend Yield', name_ja: '高配当利回り', category: 'style', style: 'yield', 
    etfs: [{ ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF', description: '高水準の配当' }],
    background_logic: 'バリュー株優位の展開や、インカムゲインを重視する相場で堅調。' },
  { name: 'Quality Dividend', name_ja: 'クオリティ高配当', category: 'style', style: 'yield', 
    etfs: [{ ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', description: '財務優良な配当株' }],
    background_logic: '高いROEと安定配当を両立し、総還元を重視。' },
  { name: 'Large Cap Value', name_ja: '大型バリュー株', category: 'style', style: 'value', 
    etfs: [{ ticker: 'VTV', name: 'Vanguard Value ETF', description: '割安な大型株' }],
    background_logic: '金利上昇局面や割高感の是正時に選好される割安株。' },
  { name: 'Large Cap Growth', name_ja: '大型グロース株', category: 'style', style: 'growth', 
    etfs: [{ ticker: 'VUG', name: 'Vanguard Growth ETF', description: '高い成長率の大型株' }],
    background_logic: '金利低下局面でのバリュエーション拡大を享受。' },
  { name: 'Low Volatility', name_ja: '低ボラティリティ', category: 'style', style: 'defensive', 
    etfs: [{ ticker: 'USMV', name: 'iShares MSCI USA Min Vol Factor ETF', description: '値動きが穏やか' }],
    background_logic: '市場の不確実性が高い時期に価格変動の中和を狙う。' },
  { name: 'Momentum Factor', name_ja: 'モメンタム・ファクター', category: 'style', style: 'growth', 
    etfs: [{ ticker: 'MTUM', name: 'iShares MSCI USA Momentum Factor', description: '直近上昇の強い銘柄' }],
    background_logic: '強いトレンドが形成されている相場で「勝馬」に乗る戦略。' },
  { name: 'Quality Factor', name_ja: 'クオリティ・ファクター', category: 'style', style: 'value', 
    etfs: [{ ticker: 'QUAL', name: 'iShares MSCI USA Quality Factor ETF', description: '高収益・低負債' }],
    background_logic: '景気後退が懸念される中で、財務の健全性を最重視する。' },
  { name: 'Share Buyback', name_ja: '自社株買い選好', category: 'style', style: 'value', 
    etfs: [{ ticker: 'PKW', name: 'Invesco BuyBack Achievers ETF', description: '強力な自社株買い企業' }],
    background_logic: '企業自身による株式需給の好転（株主還元）を狙う。' },
  { name: 'Small Cap Value', name_ja: '小型バリュー株', category: 'style', style: 'value', 
    etfs: [{ ticker: 'VBR', name: 'Vanguard Small-Cap Value ETF', description: '割安な小型株' }],
    background_logic: '金利サイクル転換や景気回復初期に最もアウトパフォームしやすい。' },

  // 31-40: Thematic (AI, Tech, Special rules)
  { name: 'Semiconductors', name_ja: '半導体・AIチップ', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'SMH', name: 'VanEck Semiconductor ETF', description: '半導体大手' }, { ticker: 'SOXX', name: 'iShares Semiconductor ETF', description: '米半導体' }],
    background_logic: 'AIの急速な普及によりデータセンターや半導体の需要が爆発的に増加。' },
  { name: 'Cyber Security', name_ja: 'サイバーセキュリティ', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'CIBR', name: 'First Trust NASDAQ Cybersecurity ETF', description: 'セキュリティ関連' }, { ticker: 'HACK', name: 'ETFMG Prime Cyber Security ETF', description: 'ハッカー対策' }],
    background_logic: '地政学的リスクやクラウド移行による防衛予算の拡大が見込まれる。' },
  { name: 'Cloud Computing', name_ja: 'クラウドコンピューティング', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'SKYY', name: 'First Trust Cloud Computing ETF', description: 'クラウド企業' }],
    background_logic: '企業DXの進展とともに安定したサブスク収益基盤を持つ。' },
  { name: 'Biotechnology', name_ja: 'バイオテクノロジー', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'XBI', name: 'SPDR S&P Biotech ETF', description: '中小型バイオ' }, { ticker: 'IBB', name: 'iShares Biotechnology ETF', description: '大型バイオ' }],
    background_logic: '金利低下による資金調達の容易化やM&A活発化で飛躍する。' },
  { name: 'Clean Energy', name_ja: 'クリーンエネルギー', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'ICLN', name: 'iShares Global Clean Energy ETF', description: '再生可能エネルギー' }, { ticker: 'TAN', name: 'Invesco Solar ETF', description: '太陽光発電' }],
    background_logic: '政府の支援策や金利低下による設備投資の再開期待。' },
  { name: 'Aerospace & Defense', name_ja: '航空宇宙・防衛', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'ITA', name: 'iShares U.S. Aerospace & Defense ETF', description: '防衛産業' }],
    background_logic: '緊迫する地政学イベントに対するヘッジとしての実需。' },
  { name: 'Homebuilders', name_ja: '住宅建設・不動産開発', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'XHB', name: 'SPDR S&P Homebuilders ETF', description: '住宅建設' }, { ticker: 'ITB', name: 'iShares U.S. Home Construction ETF', description: '建築材料' }],
    background_logic: '新築住宅不足と金利低下シナリオによる需要回復。' },
  { name: 'Regional Banks', name_ja: '地方銀行', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'KRE', name: 'SPDR S&P Regional Banking ETF', description: '米地方銀行' }],
    background_logic: 'イールドカーブの正常化（逆イールド解消）による利ざや改善期待。' },
  { name: 'Uranium & Nuclear', name_ja: 'ウラン・原子力', category: 'sector', style: 'value', 
    etfs: [{ ticker: 'URA', name: 'Global X Uranium ETF', description: 'ウラン採掘' }],
    background_logic: 'AI稼働に伴う電力需要爆発と、脱炭素の現実解としての原発回帰。' },
  { name: 'Bitcoin Proxy', name_ja: 'ビットコイン・暗号資産', category: 'sector', style: 'growth', 
    etfs: [{ ticker: 'IBIT', name: 'iShares Bitcoin Trust', description: 'ビットコインETF' }, { ticker: 'MSTR', name: 'MicroStrategy', description: '（参考）BTC保有企業' }],
    background_logic: '金融緩和時の過剰流動性や、デジタルゴールドとしての逃避資金受け皿。' },

  // 41-50: Bonds, Commodities, Global
  { name: 'Long Term Treasury', name_ja: '超長期米国債', category: 'defensive', style: 'yield', 
    etfs: [{ ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond', description: '20年超米国債' }],
    background_logic: '深刻な景気後退やインフレ沈静化による急激な利下げの恩恵を最大化。' },
  { name: 'Short Term Treasury', name_ja: '短期米国債（キャッシュ代用）', category: 'defensive', style: 'yield', 
    etfs: [{ ticker: 'SHV', name: 'iShares Short Treasury Bond', description: '1年未満米国債' }, { ticker: 'SHY', name: 'iShares 1-3 Year Treasury Bond', description: '1-3年債' }],
    background_logic: 'パニック相場における現金の一時的な退避先。' },
  { name: 'High Yield Corporate', name_ja: 'ハイイールド社債', category: 'defensive', style: 'yield', 
    etfs: [{ ticker: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond', description: '投機的格付け社債' }],
    background_logic: '景気ソフトランディングかつ金利安定期における高いインカム。' },
  { name: 'Physical Gold', name_ja: '実物ゴールド', category: 'defensive', style: 'defensive', 
    etfs: [{ ticker: 'GLD', name: 'SPDR Gold Shares', description: '金地金' }, { ticker: 'IAU', name: 'iShares Gold Trust', description: '金' }],
    background_logic: 'インフレ再燃懸念、ドルに対する信認低下、または究極の非常時ヘッジ。' },
  { name: 'Silver & Precious Metals', name_ja: 'シルバー・貴金属', category: 'defensive', style: 'defensive', 
    etfs: [{ ticker: 'SLV', name: 'iShares Silver Trust', description: '銀' }],
    background_logic: '工業用需要の強さと、ゴールド追随による価格上昇モメンタム。' },
  { name: 'Broad Commodities', name_ja: '幅広いコモディティ', category: 'defensive', style: 'defensive', 
    etfs: [{ ticker: 'PDBC', name: 'Invesco Optimum Yield Diversified Commodity', description: '原油金農産物等' }],
    background_logic: '供給網の混乱や資源インフレを捉える現物資産ヘッジ。' },
  { name: 'Emerging Markets', name_ja: '新興国株式', category: 'core-index', style: 'growth', 
    etfs: [{ ticker: 'VWO', name: 'Vanguard Emerging Markets', description: '米国外新興国' }],
    background_logic: 'ドル安進行時の相対的なアウトパフォーム期待。' },
  { name: 'Developed Markets ex-US', name_ja: '先進国株（米国以外）', category: 'core-index', style: 'value', 
    etfs: [{ ticker: 'VEA', name: 'Vanguard Developed Markets Index', description: '日本・欧州等' }],
    background_logic: '米国株に対するバリュエーションの割安感が評価される局面。' },
  { name: 'Japan Equity', name_ja: '日本株', category: 'core-index', style: 'value', 
    etfs: [{ ticker: 'EWJ', name: 'iShares MSCI Japan ETF', description: '日本国内企業' }],
    background_logic: 'コーポレートガバナンス改革と円の動向に支えられた再評価。' },
  { name: 'India Equity', name_ja: 'インド株', category: 'core-index', style: 'growth', 
    etfs: [{ ticker: 'INDA', name: 'iShares MSCI India ETF', description: 'インド企業' }],
    background_logic: '長期的かつ高い経済成長力への資金シフト。' }
]

async function seed() {
  console.log('Clearing existing baskets...')
  await supabase.from('baskets').delete().neq('id', 'dummy-id')

  console.log(`Inserting ${basketsData.length} baskets...`)
  
  const mapped = basketsData.map((b) => ({
    ...b,
    strategy_name: `${b.name} Momentum`,
    strategy_name_ja: `${b.name_ja} モメンタム`,
    entry_condition: '市場のレジーム判断に基づき、条件合致時にエントリー',
    exit_take_profit: '+5% 〜 +8%',
    exit_stop_loss: '-3%',
    skip_condition: '重要イベント（CPI等）直前、またはVIX急騰時',
    invalidation_condition: '市場レジームの転換やトレンド崩れ',
    hold_period_days: '5〜20日',
    confidence_score: 75,
    tailwind_factors: [],
    headwind_factors: [],
    similar_period_comment: 'システムによる自動選定による',
    risk_level: b.style === 'defensive' || b.category === 'defensive' ? 'low' : 
                b.style === 'growth' || b.category === 'sector' ? 'high' : 'medium'
  }))

  const { data, error } = await supabase.from('baskets').insert(mapped).select()

  if (error) {
    console.error('Error inserting baskets:', error)
  } else {
    console.log(`Successfully added ${data.length} baskets!`)
  }
}

seed()
