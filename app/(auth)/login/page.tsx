'use client'

import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const { login } = useAppStore()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        if (data.user) {
          login(data.user.email || '', data.user.user_metadata?.display_name || 'ユーザー', data.user.id)
          router.push('/home')
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name }
          }
        })
        if (error) throw error
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setErrorMsg('このメールアドレスは既に登録されています。')
          return
        }
        setSuccessMsg('確認メールを送信しました！メール内のリンクをクリックして登録を完了してください。')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* ロゴ */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 64, height: 64, background: 'var(--accent)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'white',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-accent)',
          }}>
            TC
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Trade Compass
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            市場を読む。自分に合う戦略を知る。<br />模擬ディールで試す。短く振り返る。
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ニックネーム</label>
              <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 田中 太郎" />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>メールアドレス</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>パスワード</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {errorMsg && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: 'var(--success)', fontSize: 12, marginTop: 4 }}>{successMsg}</div>}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成して始める')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {isLogin ? '新規アカウントを作成' : 'ログインに戻る'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          このアプリは投資判断の支援ツールです。<br />
          将来の成果を保証するものではありません。
        </p>
      </div>
    </div>
  )
}
