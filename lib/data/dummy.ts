import {
  MarketSnapshot,
  MarketRegime,
  MarketEvent,
  Basket,
  Deal,
  PaperTrade,
  DealReview,
  UserBehaviorProfile,
  Notification,
  DataFreshnessStatus,
} from '@/types'

// ============================================================
// Dummy Market Snapshot
// ============================================================
export const dummyMarketSnapshot: MarketSnapshot = {
  id: 'snap-001',
  timestamp: new Date().toISOString(),
  sp500: 5480.2,
  sp500_change_pct: 0.82,
  nasdaq100: 19120.5,
  nasdaq100_change_pct: 1.24,
  russell2000: 2058.3,
  russell2000_change_pct: 0.41,
  vix: 16.4,
  us10y_yield: 3.87,
  dxy: 103.2,
  crude_oil: 78.4,
  above_200ma_ratio: 68,
  new_52w_high_count: 142,
  credit_spread: 1.12,
  sector_strength: {
    technology: 82,
    healthcare: 58,
    energy: 61,
    financials: 67,
    consumer_staples: 44,
    utilities: 39,
    semiconductors: 87,
    real_estate: 35,
  },
}

// ============================================================
// Dummy Market Regime
// ============================================================
export const dummyMarketRegime: MarketRegime = {
  id: 'regime-001',
  snapshot_id: 'snap-001',
  label: 'rate-decline-tailwind',
  label_ja: '金利低下追い風',
  score_tailwind: 74,
  score_risk: 28,
  score_heat: 55,
  score_trend: 71,
  score_timing: 62,
  summary_text:
    '米10年債利回りが3.87%まで低下し、成長株・テクノロジーセクターへの追い風が強まっています。VIXは16台で安定しており、急変リスクは低め。ただし過熱感(55/100)があるため、新規エントリーは慎重に。',
  tailwind_factors: [
    '金利低下でグロース株に追い風',
    'VIX安定で急変リスク低め',
    '200日移動平均上の銘柄比率68%で市場内部は健全',
    '半導体セクターが相対的に強い',
  ],
  headwind_factors: [
    'ドル指数がやや高く、輸出企業には逆風',
    'S&P500は過熱感あり、高値圏での新規エントリーに注意',
  ],
  watch_points: [
    '今夜のFOMC議事録で金利見通しの変化を確認',
    'Russell2000の戻りが弱く、中小型株は慎重に',
    'クレジットスプレッド1.12%は許容範囲内だが上昇に注意',
  ],
  calculated_at: new Date().toISOString(),
}

// ============================================================
// Dummy Market Events
// ============================================================
export const dummyMarketEvents: MarketEvent[] = [
  {
    id: 'event-001',
    event_type: 'fomc',
    label: 'FOMC議事録公表',
    scheduled_at: new Date(Date.now() + 3600000 * 6).toISOString(),
    importance: 'high',
    is_completed: false,
    expected_value: undefined,
    note: 'FOMCの政策金利方針を確認。予想外の文言変化に注意。エントリーは通過後が安全。',
  },
  {
    id: 'event-002',
    event_type: 'cpi',
    label: 'CPI（消費者物価指数）',
    scheduled_at: new Date(Date.now() + 3600000 * 48).toISOString(),
    importance: 'high',
    is_completed: false,
    expected_value: '前月比 +0.2%',
    note: 'インフレ指標。予想を上回ると金利上昇圧力が再燃する可能性。',
  },
  {
    id: 'event-003',
    event_type: 'jobs',
    label: '雇用統計',
    scheduled_at: new Date(Date.now() + 3600000 * 120).toISOString(),
    importance: 'high',
    is_completed: false,
    expected_value: '新規雇用 +18.5万人',
    note: '雇用の強さが利下げペースに影響。強すぎると株にマイナス、弱すぎても景気悲観。',
  },
]

// ============================================================
// Dummy Baskets
// ============================================================
export const dummyBaskets: Basket[] = [
  {
    id: 'basket-001',
    name: 'Nasdaq100 Growth',
    name_ja: 'Nasdaq100 グロース',
    category: 'core-index',
    style: '大型グロース',
    background_logic:
      '金利低下局面では高PER・高成長株が再評価されやすい。Nasdaq100はテクノロジー・AI関連比率が高く、金利敏感度が高い。',
    strategy_name: 'Growth Momentum',
    strategy_name_ja: '成長株順張り戦略',
    etfs: [
      { ticker: 'QQQ', name: 'Invesco QQQ Trust', description: 'Nasdaq100連動ETF。テック・AI中心。' },
      { ticker: 'QQQM', name: 'Invesco QQQM', description: 'QQQの低コスト版。長期保有向け。' },
    ],
    entry_condition:
      'QQQが21日移動平均を上回り、VIXが20以下の状態で維持されている場合。金利低下トレンドが継続していること。',
    exit_take_profit: 'エントリーから+7〜10%、または保有開始から30日',
    exit_stop_loss: 'エントリーから-5%、または21日移動平均を明確に割り込んだ場合',
    skip_condition: 'VIXが20を超えている、またはFOMCなど重要イベント前48時間',
    invalidation_condition:
      '10年債利回りが4.3%を超えて上昇基調に転換した場合。または景気後退データが明確になった場合。',
    hold_period_days: '2〜4週間',
    confidence_score: 72,
    tailwind_factors: ['金利低下が順風', 'AI・半導体需要継続', 'VIX安定'],
    headwind_factors: ['過熱感、高値圏での新規エントリーリスク', '金利反転リスク'],
    similar_period_comment: '2023年6〜7月の局面に類似。金利ピークアウト直後に成長株が大きく反発した。',
    risk_level: 'medium',
  },
  {
    id: 'basket-002',
    name: 'Semiconductor Sector',
    name_ja: '半導体セクター',
    category: 'sector',
    style: 'セクター・グロース',
    background_logic:
      'AI需要拡大を背景に半導体の設備投資サイクルが継続。金利低下で高成長・高PER銘柄の再評価が起きやすい。',
    strategy_name: 'Sector Rotation',
    strategy_name_ja: 'セクターローテーション戦略',
    etfs: [
      { ticker: 'SOXX', name: 'iShares Semiconductor ETF', description: '主要半導体メーカー30社。' },
      { ticker: 'SMH', name: 'VanEck Semiconductor ETF', description: 'NVIDIAなど主要銘柄に集中。' },
    ],
    entry_condition:
      'SOXXが52週高値の90%以上、かつ直近5日間で相対強度がNasdaq100を上回っている場合',
    exit_take_profit: 'エントリーから+8〜12%、またはセクター強度が低下に転じた時',
    exit_stop_loss: 'エントリーから-6%',
    skip_condition: '主要決算集中週、またはエヌビディア等コア銘柄の決算前後48時間',
    invalidation_condition: '半導体受注データが前月比マイナスに転じた場合。または米中輸出規制の強化。',
    hold_period_days: '2〜6週間',
    confidence_score: 68,
    tailwind_factors: ['AI需要継続', '金利低下追い風', 'セクター強度最高位'],
    headwind_factors: ['集中度リスク（NVIDA依存）', '過熱感あり', '米中関係悪化リスク'],
    similar_period_comment: '2024年2〜3月の局面に類似。AI関連の決算好調を受けてSMHが6週間で18%上昇。',
    risk_level: 'high',
  },
  {
    id: 'basket-003',
    name: 'S&P500 Core',
    name_ja: 'S&P500 コア',
    category: 'core-index',
    style: '広域分散',
    background_logic:
      '市場のベース資産。レジームが不明確な局面では、個別セクターより広域分散が安心。コアとして小さく持つ戦略。',
    strategy_name: 'Core Hold',
    strategy_name_ja: '広域コア保有戦略',
    etfs: [
      { ticker: 'SPY', name: 'SPDR S&P500 ETF', description: 'S&P500連動ETF。最も流動性が高い。' },
      { ticker: 'VOO', name: 'Vanguard S&P500 ETF', description: '低コスト版。長期保有に適切。' },
    ],
    entry_condition:
      'S&P500が200日移動平均上にあり、VIX20以下で市場内部（200MA上銘柄比率）が60%以上の場合',
    exit_take_profit: 'エントリーから+5〜7%、または長期保有が前提なら目標なし',
    exit_stop_loss: 'エントリーから-4%、または200日移動平均を明確に割り込んだ場合',
    skip_condition: 'VIX30超、市場内部が40%以下の場合は見送りを推奨',
    invalidation_condition: 'リセッション（景気後退）データが2ヶ月連続で確認された場合',
    hold_period_days: '数週間〜長期',
    confidence_score: 78,
    tailwind_factors: ['広域分散でリスク低め', '市場内部が健全', 'VIX安定'],
    headwind_factors: ['過熱感から高値圏での新規エントリーリスク', '成長性はセクター型より低い'],
    similar_period_comment: '現在は2023年10月〜2024年3月のトレンド継続局面に類似。調整後の上昇が続いた。',
    risk_level: 'low',
  },
  {
    id: 'basket-004',
    name: 'Defensive High Dividend',
    name_ja: '高配当ディフェンシブ',
    category: 'defensive',
    style: '高配当・防御',
    background_logic:
      '市場不透明感が高まった局面での防御資産。配当収入が安定したキャッシュフローを提供。金利低下局面でも配当利回りの相対価値が上昇。',
    strategy_name: 'Defensive High Dividend',
    strategy_name_ja: '高配当防御戦略',
    etfs: [
      { ticker: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', description: '高配当・高品質米国株。' },
      { ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF', description: '幅広い高配当株。' },
    ],
    entry_condition: 'VIXが上昇基調、または市場内部が悪化しつつある局面。景気減速懸念が高まった時。',
    exit_take_profit: '市場正常化後に成長株へ資金移動、または+5%',
    exit_stop_loss: 'エントリーから-3%',
    skip_condition: '強いリスクオン局面では成長株に劣後するため、優先度を下げる',
    invalidation_condition: 'インフレ再燃で大幅な金利上昇が起きた場合。配当利回りの相対価値が失われる。',
    hold_period_days: '数ヶ月〜長期',
    confidence_score: 64,
    tailwind_factors: ['景気減速ヘッジ', '安定配当', '金利低下で配当価値上昇'],
    headwind_factors: ['リスクオン局面では成長株に劣後', 'インフレ再燃リスク'],
    similar_period_comment: '2022年のリスクオフ局面でSPYが-20%の時にSCHDは-7%に留まった。',
    risk_level: 'low',
  },
]

// ============================================================
// Dummy Deals
// ============================================================
export const dummyDeals: Deal[] = [
  {
    id: 'deal-001',
    basket_id: 'basket-001',
    basket: dummyBaskets[0],
    name: 'QQQ Dip Entry',
    name_ja: 'QQQ 押し目狙い',
    target_etfs: [
      { ticker: 'QQQ', name: 'Invesco QQQ Trust', description: 'Nasdaq100連動ETF' },
    ],
    regime_label: 'rate-decline-tailwind',
    recommended_action:
      '条件がそろいつつあります。VIX安定・金利低下継続でQQQへの押し目エントリーが可能な局面。まずは模擬ディールで確認を。',
    entry_condition:
      'QQQが直近高値から2〜4%押したところ。21日移動平均付近での反発確認後エントリー。',
    take_profit_line: '+7%(約$530付近)',
    stop_loss_line: '-5%(約$468付近)',
    invalidation_condition:
      '10年債利回りが4.2%を超えた場合、またはVIXが22を超えた場合',
    hold_period_days: '2〜3週間',
    risk_level: 'medium',
    confidence_score: 70,
    counter_scenario:
      '金利が再度上昇に転じる、または予想外のインフレデータが出た場合、グロース株は急落する可能性がある。',
    similar_past_case:
      '2023年10月末〜11月初の局面。金利ピークアウト後にQQQは6週間で+18%上昇した。',
    event_caution_note:
      '今夜のFOMC議事録前後は値動きが荒くなりやすい。通過後の相場確認を推奨。',
    generated_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'active',
  },
  {
    id: 'deal-002',
    basket_id: 'basket-002',
    basket: dummyBaskets[1],
    name: 'SOXX Breakout Watch',
    name_ja: '半導体ブレイクアウト',
    target_etfs: [
      { ticker: 'SOXX', name: 'iShares Semiconductor ETF', description: '半導体ETF' },
    ],
    regime_label: 'rate-decline-tailwind',
    recommended_action:
      '半導体セクターに追い風が増しています。ただし過熱感もあるため、新規エントリーは小さめまたは模擬推奨。',
    entry_condition:
      'SOXXが直近高値を明確にブレイクした翌日の下ヒゲ確認後エントリー。出来高が平均を上回ること。',
    take_profit_line: '+10%(約$250付近)',
    stop_loss_line: '-6%(約$212付近)',
    invalidation_condition:
      'SOXXが21日移動平均を割り込み、半導体指数([SOX])が相対劣位になった場合',
    hold_period_days: '3〜6週間',
    risk_level: 'high',
    confidence_score: 62,
    counter_scenario:
      '米中輸出規制強化、またはNVIDIA等コア銘柄の決算ミスが起きると、セクター全体が急落するリスクがある。',
    similar_past_case:
      '2024年2月のブレイクアウト局面。AI需要好調を背景にSMHが4週間で+22%上昇。',
    event_caution_note:
      'NVIDIA決算（約3週間後）前後は値動き注意。決算前48時間はエントリー推奨しない。',
    generated_at: new Date().toISOString(),
    valid_until: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'active',
  },
]

// ============================================================
// Dummy Paper Trades
// ============================================================
export const dummyPaperTrades: PaperTrade[] = [
  {
    id: 'pt-001',
    user_id: 'user-001',
    deal_id: 'deal-closed-001',
    deal: {
      ...dummyDeals[0],
      id: 'deal-closed-001',
      name_ja: 'QQQ 押し目（先週）',
      status: 'closed',
    },
    entry_price: 472.5,
    entry_date: new Date(Date.now() - 86400000 * 7).toISOString(),
    virtual_amount: 500000,
    lot_size: 10,
    exit_price: 489.2,
    exit_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    exit_reason: 'take-profit',
    result_pnl: 167000,
    result_pct: 3.54,
    status: 'closed',
    rule_followed: true,
    emotion_state_entry: 'calm',
    emotion_state_exit: 'calm',
    max_drawdown: -1.2,
    max_unrealized_gain: 3.9,
  },
  {
    id: 'pt-002',
    user_id: 'user-001',
    deal_id: 'deal-closed-002',
    deal: {
      ...dummyDeals[1],
      id: 'deal-closed-002',
      name_ja: '半導体 先々週',
      status: 'closed',
    },
    entry_price: 228.4,
    entry_date: new Date(Date.now() - 86400000 * 14).toISOString(),
    virtual_amount: 300000,
    lot_size: 5,
    exit_price: 215.1,
    exit_date: new Date(Date.now() - 86400000 * 8).toISOString(),
    exit_reason: 'stop-loss',
    result_pnl: -66500,
    result_pct: -5.83,
    status: 'closed',
    rule_followed: false,
    emotion_state_entry: 'excited',
    emotion_state_exit: 'fearful',
    max_drawdown: -5.9,
    max_unrealized_gain: 1.2,
  },
]

// ============================================================
// Dummy User Profile
// ============================================================
export const dummyUserProfile: UserBehaviorProfile = {
  user_id: 'user-001',
  experience_level: 'intermediate',
  hold_period: 'swing',
  risk_tolerance: 'medium',
  profit_taking_style: 'early',
  investment_goal: 'growth',
  anxiety_triggers: ['big-drop', 'night-move'],
  interest_areas: ['tech', 'etf', 'semiconductor'],
  high_vol_tolerance: 45,
  overnight_tolerance: 60,
  skip_tendency: 30,
  notification_follow_rate: 72,
  rule_compliance_rate: 68,
  failure_patterns: ['early-profit-taking', 'fomo-chase'],
}

// ============================================================
// Dummy Notifications
// ============================================================
export const dummyNotifications: Notification[] = [
  {
    id: 'notif-001',
    user_id: 'user-001',
    type: 'important',
    title: '今日の注目アクションは1件です',
    body: 'QQQ押し目ディールが条件接近中。今夜のFOMC議事録通過後に確認を推奨します。まずは模擬ディールで試してみましょう。',
    action_label: 'ディールを見る',
    action_url: '/deals/deal-001',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: 'user-001',
    type: 'scheduled',
    title: '引け後レビューを忘れずに',
    body: '先週の模擬ディール結果が出ています。20秒のライトレビューで振り返りを完了しましょう。',
    action_label: 'レビューへ',
    action_url: '/reviews',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-003',
    user_id: 'user-001',
    type: 'important',
    title: '市場レジームが変化しました',
    body: '金利低下追い風の強度が上昇。成長株・Nasdaq100バスケットの優先度が上がっています。',
    action_label: '市場を見る',
    action_url: '/market',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

// ============================================================
// Dummy Reviews (pending)
// ============================================================
export const dummyPendingReviews = [
  { id: 'rev-001', trade_id: 'pt-001', deal_name: 'QQQ 押し目（先週）', type: 'light' as const },
  { id: 'rev-002', trade_id: 'pt-002', deal_name: '半導体 先々週', type: 'standard' as const },
]

// ============================================================
// Dummy Dashboard Data
// ============================================================
export const dummyDashboardData = {
  performance: {
    total_pnl: 100500,
    total_pnl_pct: 3.2,
    win_rate: 62,
    avg_win: 4.8,
    avg_loss: -3.1,
    risk_reward: 1.55,
    expectancy: 1.8,
    max_drawdown: -8.4,
    trade_count: 13,
  },
  behavior: {
    rule_compliance_rate: 68,
    notification_follow_rate: 72,
    skip_rate: 31,
    fomo_chase_rate: 18,
    early_exit_rate: 38,
    late_stop_rate: 12,
  },
  psychology: {
    calm_win_rate: 71,
    anxious_win_rate: 44,
    greedy_win_rate: 38,
  },
  market_fit: {
    risk_on_win_rate: 68,
    risk_off_win_rate: 45,
    high_vol_win_rate: 32,
    rate_decline_win_rate: 72,
  },
  insights: [
    {
      category: 'behavior' as const,
      title: '利確が平均1.8日早い傾向にあります',
      suggestion: '目標ラインまでホールドする練習を意識しましょう。ルール通りの利確ができた時の成績は+29%改善しています。',
      severity: 'warning' as const,
    },
    {
      category: 'psychology' as const,
      title: '冷静時と不安時で勝率に27%の差があります',
      suggestion: '不安を感じた日は、エントリーを見送るかサイズを小さくすることで、成績が安定する可能性があります。',
      severity: 'warning' as const,
    },
    {
      category: 'performance' as const,
      title: '先月比: ルール遵守率が+12%改善しています',
      suggestion: '損切り判断が以前より改善しています。この調子で続けましょう。',
      severity: 'positive' as const,
    },
    {
      category: 'market-fit' as const,
      title: '金利低下局面での勝率が72%と最も高い',
      suggestion: '現在の市場環境（金利低下追い風）はあなたが得意とする局面です。慎重に一歩進むタイミングです。',
      severity: 'positive' as const,
    },
  ],
}

// ============================================================
// Dummy Data Freshness
// ============================================================
export const dummyDataFreshness: DataFreshnessStatus = {
  scope: 'market',
  last_updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  next_expected_update_at: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
  label: 'fresh',
}
