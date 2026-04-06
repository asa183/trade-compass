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
  dummyBaskets,
  dummyDeals,
  dummyPaperTrades,
  dummyUserProfile,
  dummyNotifications,
  dummyMarketEvents,
  dummyPendingReviews,
  dummyDashboardData,
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
  pendingReviews: typeof dummyPendingReviews
  reviews: DealReview[]
  skipReviews: SkipReview[]

  // Notifications
  notifications: Notification[]

  // Dashboard
  dashboardData: typeof dummyDashboardData

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
  refreshMarket: () => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  // Initial state
  user: {
    id: 'user-001',
    email: 'demo@tradecompass.app',
    display_name: 'デモユーザー',
    created_at: new Date().toISOString(),
  },
  isOnboarded: true,
  profile: dummyUserProfile,

  marketSnapshot: dummyMarketSnapshot,
  marketRegime: dummyMarketRegime,
  marketEvents: dummyMarketEvents,
  dataFreshness: dummyDataFreshness,

  baskets: dummyBaskets,
  basketRecommendations: [],
  deals: dummyDeals.map((deal) => ({
    ...deal,
    execution_fit: assessExecutionFit(
      deal,
      dummyUserProfile,
      dummyPaperTrades.map((t) => ({
        rule_followed: t.rule_followed ?? true,
        emotion_state_entry: t.emotion_state_entry ?? 'calm',
      })),
      true, // hasHighVolEvent
      dummyMarketSnapshot.vix
    ),
  })),

  paperTrades: dummyPaperTrades,
  pendingReviews: dummyPendingReviews,
  reviews: [],
  skipReviews: [],

  notifications: dummyNotifications,
  dashboardData: dummyDashboardData,

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
      pendingReviews: state.pendingReviews.filter((r) => r.trade_id !== tradeId),
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

  refreshMarket: () => {
    set({ isLoading: true })
    setTimeout(() => {
      // Simulate a refresh — in production, fetch from API
      const recs = selectBaskets(get().marketRegime, get().profile!, get().baskets)
      set({ basketRecommendations: recs, isLoading: false })
    }, 1200)
  },
}))
