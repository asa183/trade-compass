'use client'

import { useAppStore } from '@/stores/useAppStore'
import { Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useAppStore()

  const typeConfig = {
    instant: { label: '即時', color: 'var(--danger)', bg: 'var(--danger-dim)' },
    important: { label: '重要', color: 'var(--warning)', bg: 'var(--warning-dim)' },
    scheduled: { label: '定期', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ paddingTop: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          通知
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          状態変化ではなく、次の行動をお伝えします
        </p>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Bell size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>通知はありません</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n) => {
            const conf = typeConfig[n.type]
            const timeStr = format(new Date(n.created_at), 'M/d HH:mm', { locale: ja })
            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                style={{
                  background: n.is_read ? 'var(--bg-card)' : 'var(--bg-elevated)',
                  border: `1px solid ${n.is_read ? 'var(--border)' : 'var(--border-strong)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {!n.is_read && (
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-full)', background: conf.bg, color: conf.color }}>
                    {conf.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeStr}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {n.title}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{n.body}</p>
                {n.action_url && n.action_label && (
                  <Link href={n.action_url} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                    {n.action_label}
                    <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
