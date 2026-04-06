'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RootPage() {
  const { user, isOnboarded } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    } else if (!isOnboarded) {
      router.replace('/onboarding')
    } else {
      router.replace('/home')
    }
  }, [user, isOnboarded, router])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 64, height: 64, background: 'var(--accent)',
        borderRadius: 18, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        TC
      </div>
    </div>
  )
}
