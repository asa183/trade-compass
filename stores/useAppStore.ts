import { create } from 'zustand'
import {
  User,
  UserBehaviorProfile,
  MarketRegime,
  MarketSnapshot,
  Basket,
  Deal,
  PaperTrade,
  DealReview,
  Notification,
  BasketRecommendation,
  MarketEvent,
  OnboardingAnswers,
  DataFreshnessStatus,
  SkipReview,
} from '@/types'
import { assessExecutionFit, selectBaskets } from '@/lib/engine'

// Initial Empty Data
const emptyMarketSnapshot: MarketSnapshot = {
  id: '', timestamp: '', sp500: 0, sp500_change_pct: 0, nasdaq100: 0, nasdaq100_change_pct: 0, russell2000: 0, russell2000_change_pct: 0, vix: 0, us10y_yield: 0, dxy: 0, crude_oil: 0, above_200ma_ratio: 0, new_52w_high_count: 0, credit_spread: 0, sector_strength: { technology: 0, healthcare: 0, energy: 0, financials: 0, consumer_staples: 0, utilities: 0, semiconductors: 0, real_estate: 0 }
}

const emptyMarketRegime: MarketRegime = {
  id: '', snapshot_id: '', label: 'risk-on', label_ja: '読み込み中...', score_tailwind: 0, score_risk: 0, score_heat: 0, score_trend: 0, score_timing: 0, summary_text: 'リアルタイム市場データを分析中です...', tailwind_factors: [], headwind_factors: [], watch_points: [], calculated_at: ''
}

const emptyDataFreshness: DataFreshnessStatus = {
  scope: 'market', last_updated_at: '', next_expected_update_at: '', label: 'stale'
}

interface AppState {
  // Auth
  user: User | null
  isAuthInitialized: boolean
  isOnboarded: boolean
  profile: UserBehaviorProfile | null

  // Market
  marketSnapshot: MarketSnapshot
  marketRegime: MarketRegime
  marketEvents: MarketEvent[]
  dataFreshness: DataFreshnessStatus

  // Baskets & Deals
  baskets: Basket[]
  basketRecommendations: BasketRecommendation[]
  deals: Deal[]

  // Paper Trades
  paperTrades: PaperTrade[]
  pendingReviews: { id: string; trade_id: string; deal_name: string; type: 'light' | 'standard' }[]
  reviews: DealReview[]
  skipReviews: SkipReview[]

  // Notifications
  notifications: Notification[]

  // Dashboard
  dashboardData: {
    performance: { total_pnl: number; total_pnl_pct: number; win_rate: number; avg_win: number; avg_loss: number; risk_reward: number; expectancy: number; max_drawdown: number; trade_count: number };
    behavior: { rule_compliance_rate: number; notification_follow_rate: number; skip_rate: number; fomo_chase_rate: number; early_exit_rate: number; late_stop_rate: number };
    psychology: { calm_win_rate: number; anxious_win_rate: number; greedy_win_rate: number };
    market_fit: { risk_on_win_rate: number; risk_off_win_rate: number; high_vol_win_rate: number; rate_decline_win_rate: number };
    insights: { category: 'behavior' | 'psychology' | 'performance' | 'market-fit'; title: string; suggestion: string; severity: 'positive' | 'warning' | 'negative' }[];
  }

  // UI state
  isLoading: boolean
  activeTab: string

  // Actions
  login: (email: string, name: string, id: string) => void
  logout: () => void
  completeOnboarding: (answers: OnboardingAnswers) => Promise<void>
  setActiveTab: (tab: string) => void
  startPaperTrade: (dealId: string, amount: number) => Promise<void>
  closePaperTrade: (tradeId: string, exitPrice: number, reason: PaperTrade['exit_reason']) => Promise<void>
  submitLightReview: (tradeId: string, review: Partial<DealReview>) => Promise<void>
  skipDeal: (dealId: string, reason: string) => Promise<void>
  submitSkipReview: (skipId: string, review: Partial<SkipReview>) => Promise<void>
  markNotificationRead: (id: string) => void
  fetchMarketData: () => Promise<void>
  fetchDeals: () => Promise<void>
  fetchBaskets: () => Promise<void>
  fetchUserData: () => Promise<void>
  setAuthInitialized: (isInitialized: boolean) => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial state
  user: null,
  isOnboarded: false,
  profile: null,
  isAuthInitialized: false,

  // Keep empty fallback until fetched
  marketSnapshot: emptyMarketSnapshot,
  marketRegime: emptyMarketRegime,
  marketEvents: [],
  dataFreshness: emptyDataFreshness,

  baskets: [],
  basketRecommendations: [],
  deals: [],

  paperTrades: [],
  pendingReviews: [],
  reviews: [],
  skipReviews: [],

  notifications: [],
  dashboardData: {
    performance: { total_pnl: 0, total_pnl_pct: 0, win_rate: 0, avg_win: 0, avg_loss: 0, risk_reward: 0, expectancy: 0, max_drawdown: 0, trade_count: 0 },
    behavior: { rule_compliance_rate: 0, notification_follow_rate: 0, skip_rate: 0, fomo_chase_rate: 0, early_exit_rate: 0, late_stop_rate: 0 },
    psychology: { calm_win_rate: 0, anxious_win_rate: 0, greedy_win_rate: 0 },
    market_fit: { risk_on_win_rate: 0, risk_off_win_rate: 0, high_vol_win_rate: 0, rate_decline_win_rate: 0 },
    insights: []
  },

  isLoading: false,
  activeTab: 'home',

  // --- Actions ---
  setAuthInitialized: (val) => set({ isAuthInitialized: val }),

  login: (email, name, id) => {
    set({
      user: {
        id,
        email,
        display_name: name,
        created_at: new Date().toISOString(),
      },
    })
  },

  logout: () => {
    set({ user: null, isOnboarded: false, profile: null })
  },

  fetchUserData: async () => {
    const userId = get().user?.id
    if (!userId) return

    set({ isLoading: true })
    try {
      const { supabase } = await import('@/lib/supabase')
      
      const [
        { data: profile },
        { data: paperTrades },
        { data: dealReviews },
        { data: skipReviews }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('paper_trades').select('*').eq('user_id', userId).order('entry_date', { ascending: false }),
        supabase.from('deal_reviews').select('*').eq('user_id', userId).order('reviewed_at', { ascending: false }),
        supabase.from('skip_reviews').select('*').eq('user_id', userId).order('reviewed_at', { ascending: false })
      ])

      const updates: Partial<AppState> = {}
      if (profile) Object.assign(updates, { profile, isOnboarded: true })
      if (paperTrades) Object.assign(updates, { paperTrades: paperTrades.map((t: any) => ({ ...t, deal: t.deal_data })) })
      if (dealReviews) Object.assign(updates, { reviews: dealReviews })
      if (skipReviews) Object.assign(updates, { skipReviews })

      set(updates)
    } catch (err) {
      console.error('Failed to fetch user data', err)
    } finally {
      set({ isLoading: false })
    }
  },

  completeOnboarding: async (answers) => {
    const userId = get().user?.id
    if (!userId) {
      console.error('User not logged in.')
      return
    }

    const profile: UserBehaviorProfile = {
      user_id: userId,
      experience_level: answers.experience_level,
      hold_period: answers.hold_period,
      risk_tolerance: answers.risk_tolerance,
      profit_taking_style: answers.profit_taking_style,
      investment_goal: answers.investment_goal,
      anxiety_triggers: answers.anxiety_triggers,
      interest_areas: answers.interest_areas,
      high_vol_tolerance: answers.risk_tolerance === 'high' ? 75 : answers.risk_tolerance === 'medium' ? 50 : 25,
      overnight_tolerance: answers.anxiety_triggers.includes('night-move') ? 35 : 65,
      skip_tendency: 30,
      notification_follow_rate: 70,
      rule_compliance_rate: 70,
      failure_patterns: [],
    }

    set({ isLoading: true })
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        experience_level: profile.experience_level,
        hold_period: profile.hold_period,
        risk_tolerance: profile.risk_tolerance,
        profit_taking_style: profile.profit_taking_style,
        investment_goal: profile.investment_goal,
        anxiety_triggers: profile.anxiety_triggers,
        interest_areas: profile.interest_areas,
        high_vol_tolerance: profile.high_vol_tolerance,
        overnight_tolerance: profile.overnight_tolerance,
        skip_tendency: profile.skip_tendency,
        notification_follow_rate: profile.notification_follow_rate,
        rule_compliance_rate: profile.rule_compliance_rate,
        failure_patterns: profile.failure_patterns
      })
      if (error) throw error

      set({ profile, isOnboarded: true })

      // バスケット推奨を再計算
      const state = get()
      const recs = selectBaskets(state.marketRegime, profile, state.baskets)
      set({ basketRecommendations: recs })
    } catch (err) {
      console.error('Failed to save profile', err)
    } finally {
      set({ isLoading: false })
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  startPaperTrade: async (dealId, amount) => {
    const deal = get().deals.find((d) => d.id === dealId)
    const userId = get().user?.id
    if (!deal || !userId) return

    set({ isLoading: true })
    try {
      const { supabase } = await import('@/lib/supabase')
      const entryPrice = parseFloat(deal.take_profit_line.match(/\$?([\d.]+)/)?.[1] ?? '100')
      const lotSize = Math.floor(amount / 500)
      
      const { data, error } = await supabase.from('paper_trades').insert({
        user_id: userId,
        deal_id: dealId,
        deal_data: deal,
        entry_price: entryPrice,
        virtual_amount: amount,
        lot_size: lotSize,
        status: 'open'
      }).select().single()
      
      if (error) throw error

      const newTrade: PaperTrade = {
        id: data.id,
        user_id: userId,
        deal_id: dealId,
        deal,
        entry_price: data.entry_price,
        entry_date: data.entry_date,
        virtual_amount: data.virtual_amount,
        lot_size: data.lot_size,
        status: data.status,
      }
      set((state) => ({ paperTrades: [newTrade, ...state.paperTrades] }))
    } catch (err) {
      console.error('Failed to start paper trade', err)
    } finally {
      set({ isLoading: false })
    }
  },

  closePaperTrade: async (tradeId, exitPrice, reason) => {
    set({ isLoading: true })
    try {
      const { supabase } = await import('@/lib/supabase')
      const trade = get().paperTrades.find(t => t.id === tradeId)
      if (!trade) return

      const pnl = (exitPrice - trade.entry_price) * trade.lot_size * 100
      const pct = ((exitPrice - trade.entry_price) / trade.entry_price) * 100
      
      const { data, error } = await supabase.from('paper_trades').update({
        exit_price: exitPrice,
        exit_date: new Date().toISOString(),
        exit_reason: reason,
        result_pnl: pnl,
        result_pct: pct,
        status: 'closed'
      }).eq('id', tradeId).select().single()

      if (error) throw error

      set((state) => ({
        paperTrades: state.paperTrades.map((t) => {
          if (t.id !== tradeId) return t
          return {
            ...t,
            exit_price: exitPrice,
            exit_date: data.exit_date,
            exit_reason: reason,
            result_pnl: pnl,
            result_pct: pct,
            status: 'closed' as const,
          }
        }),
        pendingReviews: [
          ...state.pendingReviews,
          {
            id: `rev-${Date.now()}`,
            trade_id: tradeId,
            deal_name: trade.deal.name_ja ?? 'ディール',
            type: 'light' as const,
          },
        ],
      }))
    } catch (err) {
      console.error('Failed to close trade', err)
    } finally {
      set({ isLoading: false })
    }
  },

  submitLightReview: async (tradeId, review) => {
    const userId = get().user?.id
    if (!userId) return

    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.from('deal_reviews').insert({
        paper_trade_id: tradeId,
        user_id: userId,
        review_type: 'light',
        executed: review.executed ?? true,
        satisfaction_score: review.satisfaction_score ?? 3,
        emotion_state: review.emotion_state ?? 'calm',
        rule_followed: review.rule_followed ?? true,
      }).select().single()

      if (error) throw error

      set((state) => ({
        reviews: [{
          id: data.id,
          paper_trade_id: tradeId,
          user_id: userId,
          review_type: 'light',
          executed: data.executed,
          satisfaction_score: data.satisfaction_score,
          emotion_state: data.emotion_state,
          rule_followed: data.rule_followed,
          reviewed_at: data.reviewed_at,
        }, ...state.reviews],
        pendingReviews: state.pendingReviews.filter((r: { trade_id: string }) => r.trade_id !== tradeId),
      }))
    } catch (err) {
      console.error('Failed to submit review', err)
    }
  },

  skipDeal: async (dealId, reason) => {
    const userId = get().user?.id
    if (!userId) return

    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.from('skip_reviews').insert({
        user_id: userId,
        deal_id: dealId,
        skip_reason: reason,
      }).select().single()

      if (error) throw error

      set((state) => ({ 
        skipReviews: [{
          id: data.id,
          user_id: userId,
          deal_id: dealId,
          skip_reason: data.skip_reason,
          reviewed_at: data.reviewed_at,
        }, ...state.skipReviews]
      }))
    } catch (err) {
      console.error('Failed to skip deal', err)
    }
  },

  submitSkipReview: async (skipId, review) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.from('skip_reviews').update({
        skip_reason: review.skip_reason
      }).eq('id', skipId).select().single()

      if (error) throw error

      set((state) => ({
        skipReviews: state.skipReviews.map((s) =>
          s.id === skipId ? { ...s, ...review } : s
        )
      }))
    } catch (err) {
      console.error('Failed to update skip review', err)
    }
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    }))
  },

  fetchMarketData: async () => {
    set({ isLoading: true })
    try {
      // Regime Endpoint fetches both Regime and Snapshot
      const res = await fetch('/api/engine/regime')
      if (res.ok) {
        const data = await res.json()
        set({
          marketSnapshot: data.snapshot,
          marketRegime: data.regime,
          dataFreshness: {
            scope: 'market',
            last_updated_at: data.snapshot.timestamp,
            next_expected_update_at: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            label: 'fresh'
          }
        })

        // Profileが存在すればレコメンドを再評価する
        const state = get()
        if (state.profile) {
          const recs = selectBaskets(data.regime, state.profile, state.baskets)
          set({ basketRecommendations: recs })
        }
      }
    } catch (err) {
      console.error('Failed to fetch market data and regime', err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchDeals: async () => {
    try {
      const res = await fetch('/api/engine/deals')
      if (res.ok) {
        const data = await res.json()
        set({ deals: data.deals || [] })
      }
    } catch (err) {
      console.error('Failed to fetch generated deals', err)
    }
  },

  fetchBaskets: async () => {
    try {
      const res = await fetch('/api/baskets')
      if (res.ok) {
        const data = await res.json()
        const baskets = data.baskets || []
        set({ baskets })
        
        // Profileが存在すればレコメンドを再評価する
        const state = get()
        if (state.profile) {
          const recs = selectBaskets(state.marketRegime, state.profile, baskets)
          set({ basketRecommendations: recs })
        }
      }
    } catch (err) {
      console.error('Failed to fetch baskets', err)
    }
  },
}))
