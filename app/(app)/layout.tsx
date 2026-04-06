'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MarketInitializer } from '@/components/MarketInitializer'
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  History,
  Bell,
  BookOpen,
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/home', icon: LayoutDashboard, label: 'ホーム', id: 'home' },
  { href: '/market', icon: TrendingUp, label: '市場', id: 'market' },
  { href: '/deals', icon: Layers, label: 'ディール', id: 'deals' },
  { href: '/reviews', icon: History, label: '振り返り', id: 'reviews' },
  { href: '/dashboard', icon: LayoutDashboard, label: '実績', id: 'dashboard' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isOnboarded, notifications } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (!isOnboarded) { router.push('/onboarding'); return }
  }, [user, isOnboarded, router])

  if (!user || !isOnboarded) return null

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      <MarketInitializer />

      {/* Top Bar */}
      <header className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white',
          }}>
            TC
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            Trade Compass
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Guide */}
          <Link href="/guide" style={{ color: 'var(--text-muted)', display: 'flex' }} title="使い方ガイド">
            <BookOpen size={20} />
          </Link>
          {/* Bell */}
          <Link href="/notifications" style={{ position: 'relative', color: 'var(--text-secondary)', display: 'flex' }}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--danger)',
                fontSize: 9, fontWeight: 700, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-primary)',
              }}>
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar */}
          <Link href="/profile" style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'var(--accent)',
          }}>
            U
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="page-content container">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={clsx('bottom-nav-item', isActive && 'active')}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
