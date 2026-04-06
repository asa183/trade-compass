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
import {
  dummyMarketSnapshot,
  dummyMarketRegime,
  dummyDataFreshness,
} from '@/lib/data/dummy'
import { assessExecutionFit, selectBaskets } from '@/lib/engine'

interface AppState {
  // Auth
  user: User | null
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
  login: (email: string, name: string) => void
  logout: () => void
  completeOnboarding: (answers: OnboardingAnswers) => void
  setActiveTab: (tab: string) => void
  startPaperTrade: (dealId: string, amount: number) => void
  closePaperTrade: (tradeId: string, exitPrice: number, reason: PaperTrade['exit_reason']) => void
  submitLightReview: (tradeId: string, review: Partial<DealReview>) => void
  skipDeal: (dealId: string, reason: string) => void
  submitSkipReview: (skipId: string, review: Partial<SkipReview>) => void
  markNotificationRead: (id: string) => void
  fetchMarketData: () => Promise<void>
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial state
  user: null,
  isOnboarded: false,
  profile: null,

  // Keep dummy as fallback until fetched, or just use dummy structure and overwrite soon
  marketSnapshot: dummyMarketSnapshot,
  marketRegime: dummyMarketRegime,
  marketEvents: [],
  dataFreshness: dummyDataFreshness,

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
  login: (email, name) => {
    set({
      user: {
        id: 'user-001',
        email,
        display_name: name,
        created_at: new Date().toISOString(),
      },
    })
  },

  logout: () => {
    set({ user: null, isOnboarded: false, profile: null })
  },

  completeOnboarding: (answers) => {
    const profile: UserBehaviorProfile = {
      user_id: 'user-001',
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
    set({ profile, isOnboarded: true })

    // バスケット推奨を再計算
    const recs = selectBaskets(get().marketRegime, profile, get().baskets)
    set({ basketRecommendations: recs })
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  startPaperTrade: (dealId, amount) => {
    const deal = get().deals.find((d) => d.id === dealId)
    if (!deal) return

    const newTrade: PaperTrade = {
      id: `pt-${Date.now()}`,
      user_id: 'user-001',
      deal_id: dealId,
      deal,
      entry_price: parseFloat(deal.take_profit_line.match(/\$?([\d.]+)/)?.[1] ?? '100'),
      entry_date: new Date().toISOString(),
      virtual_amount: amount,
      lot_size: Math.floor(amount / 500),
      status: 'open',
    }
    set((state) => ({ paperTrades: [newTrade, ...state.paperTrades] }))
  },

  closePaperTrade: (tradeId, exitPrice, reason) => {
    set((state) => ({
      paperTrades: state.paperTrades.map((t) => {
        if (t.id !== tradeId) return t
        const pnl = (exitPrice - t.entry_price) * t.lot_size * 100
        const pct = ((exitPrice - t.entry_price) / t.entry_price) * 100
        return {
          ...t,
          exit_price: exitPrice,
          exit_date: new Date().toISOString(),
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
          deal_name: state.paperTrades.find((t) => t.id === tradeId)?.deal.name_ja ?? 'ディール',
          type: 'light' as const,
        },
      ],
    }))
  },

  submitLightReview: (tradeId, review) => {
    const newReview: DealReview = {
      id: `review-${Date.now()}`,
      paper_trade_id: tradeId,
      user_id: 'user-001',
      review_type: 'light',
      executed: review.executed ?? true,
      satisfaction_score: review.satisfaction_score ?? 3,
      emotion_state: review.emotion_state ?? 'calm',
      rule_followed: review.rule_followed ?? true,
      reviewed_at: new Date().toISOString(),
    }
    set((state) => ({
      reviews: [newReview, ...state.reviews],
      pendingReviews: state.pendingReviews.filter((r: { trade_id: string }) => r.trade_id !== tradeId),
    }))
  },

  skipDeal: (dealId, reason) => {
    const newSkip: SkipReview = {
      id: `skip-${Date.now()}`,
      user_id: 'user-001',
      deal_id: dealId,
      skip_reason: reason,
      reviewed_at: new Date().toISOString(),
    }
    set((state) => ({ skipReviews: [newSkip, ...state.skipReviews] }))
  },

  submitSkipReview: (skipId, review) => {
    set((state) => ({
      skipReviews: state.skipReviews.map((s) =>
        s.id === skipId ? { ...s, ...review, reviewed_at: new Date().toISOString() } : s
      )
    }))
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
      const res = await fetch('/api/market')
      if (res.ok) {
        const data = await res.json()
        set({
          marketSnapshot: data.snapshot,
          dataFreshness: {
            scope: 'market',
            last_updated_at: data.snapshot.timestamp,
            next_expected_update_at: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
            label: 'fresh'
          }
        })
      }
    } catch (err) {
      console.error('Failed to fetch market data', err)
    } finally {
      set({ isLoading: false })
    }
  },
}))
