'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

export function MarketInitializer() {
  const fetchMarketData = useAppStore((state) => state.fetchMarketData)

  useEffect(() => {
    // Avoid double fetching in strict mode if possible, or just let it fetch once on mount
    fetchMarketData()
  }, [fetchMarketData])

  return null
}
