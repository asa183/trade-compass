'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/stores/useAppStore'

export default function AuthListener() {
  const { login, logout, setAuthInitialized } = useAppStore()

  useEffect(() => {
    // 初回セッションチェック
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        login(
          session.user.email || '',
          session.user.user_metadata?.display_name || 'ユーザー',
          session.user.id
        )
      }
      setAuthInitialized(true)
    })

    // ログイン状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          login(
            session.user.email || '',
            session.user.user_metadata?.display_name || 'ユーザー',
            session.user.id
          )
        }
      } else if (event === 'SIGNED_OUT') {
        logout()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [login, logout])

  return null
}
