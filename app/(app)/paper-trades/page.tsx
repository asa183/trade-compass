'use client'

import { useAppStore } from '@/stores/useAppStore'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function PaperTradesPage() {
  const { paperTrades, closePaperTrade } = useAppStore()
  const [closeModal, setCloseModal] = useState<{ tradeId: string; entryPrice: number } | null>(null)
  const [exitPrice, setExitPrice] = useState('')
  const [exitReason, setExitReason] = useState<'take-profit' | 'stop-loss' | 'manual'>('manual')

  const openTrades = paperTrades.filter((t) => t.status === 'open')
  const closedTrades = paperTrades.filter((t) => t.status === 'closed')

  const handleClose = () => {
    if (!closeModal) return
    closePaperTrade(closeModal.tradeId, parseFloat(exitPrice), exitReason)
    setCloseModal(null)
    setExitPrice('')
  }

  function PnlDisplay({ pct, pnl }: { pct?: number; pnl?: number }) {
    if (pct === undefined) return null
    const isUp = pct >= 0
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {isUp ? <TrendingUp size={14} color="var(--success)" /> : <TrendingDown size={14} color="var(--danger)" />}
        <span style={{ fontSize: 16, fontWeight: 800, color: isUp ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
          {isUp ? '+' : ''}{pct.toFixed(2)}%
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ paddingTop: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          模擬ディール
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          仮想資金で戦略を練習する場所です。実際の資金は動きません。
        </p>
      </div>

      {/* 進行中 */}
      <div>
        <div className="section-header">
          <span className="section-title">進行中</span>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{openTrades.length}件</span>
        </div>

        {openTrades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>進行中の模擬ディールはありません</div>
            <div style={{ fontSize: 12 }}>ディールカードから「模擬で試す」を選んで開始してください</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {openTrades.map((t) => (
              <div key={t.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {t.deal.name_ja}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {t.deal.target_etfs.map((e) => (
                        <span key={e.ticker} className="badge badge-accent">{e.ticker}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 11, fontWeight: 700 }}>
                    進行中
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>エントリー価格</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${t.entry_price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>仮想投資額</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      ¥{t.virtual_amount.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>開始日</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {format(new Date(t.entry_date), 'M/d', { locale: ja })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 11 }}>
                  <div style={{ background: 'var(--success-dim)', borderRadius: 8, padding: '6px 8px' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>利確目標</span>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{t.deal.take_profit_line}</div>
                  </div>
                  <div style={{ background: 'var(--danger-dim)', borderRadius: 8, padding: '6px 8px' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>損切りライン</span>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{t.deal.stop_loss_line}</div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-full"
                  style={{ fontSize: 13 }}
                  onClick={() => { setCloseModal({ tradeId: t.id, entryPrice: t.entry_price }); setExitPrice(t.entry_price.toFixed(2)) }}
                >
                  クローズ（手動終了）
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 過去のトレード */}
      <div>
        <div className="section-header">
          <span className="section-title">過去の模擬ディール</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{closedTrades.length}件</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {closedTrades.map((t) => {
            const isWin = (t.result_pct ?? 0) >= 0
            const exitReasonLabel: Record<string, string> = {
              'take-profit': '利確', 'stop-loss': '損切り', 'manual': '手動終了', 'expired': '期限切れ',
            }
            return (
              <div key={t.id} style={{ background: 'var(--bg-card)', border: `1px solid ${isWin ? 'rgba(74,186,135,0.2)' : 'rgba(208,90,90,0.2)'}`, borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {t.deal.name_ja}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {t.deal.target_etfs.slice(0, 1).map((e) => (
                        <span key={e.ticker} className="badge badge-neutral">{e.ticker}</span>
                      ))}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {exitReasonLabel[t.exit_reason ?? 'manual']}
                      </span>
                    </div>
                  </div>
                  <PnlDisplay pct={t.result_pct} pnl={t.result_pnl} />
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Clock size={10} />
                    <span>{format(new Date(t.entry_date), 'M/d', { locale: ja })} → {t.exit_date ? format(new Date(t.exit_date), 'M/d', { locale: ja }) : '—'}</span>
                  </div>
                  {t.rule_followed !== undefined && (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {t.rule_followed
                        ? <><CheckCircle size={10} color="var(--success)" /><span style={{ color: 'var(--success)' }}>ルール遵守</span></>
                        : <><XCircle size={10} color="var(--warning)" /><span style={{ color: 'var(--warning)' }}>逸脱あり</span></>
                      }
                    </div>
                  )}
                  {t.result_pnl !== undefined && (
                    <span style={{ color: t.result_pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {t.result_pnl >= 0 ? '+' : ''}¥{t.result_pnl.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* 損失時のUX（責めない） */}
                {!isWin && t.result_pct !== undefined && t.result_pct < -3 && (
                  <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    💡 想定より厳しい値動きでした。損切り判断のタイミングを振り返りに含めましょう。
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* クローズモーダル */}
      {closeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px', width: '100%', maxWidth: 480 }}>
            <div style={{ width: 40, height: 4, background: 'var(--border-strong)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>現在の価格で決済しますか？</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              入力した価格にて決済し、損益結果を確定します。<br />この操作は取り消せません。
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>終了理由</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['take-profit', 'stop-loss', 'manual'] as const).map((r) => {
                  const labels = { 'take-profit': '利確', 'stop-loss': '損切り', 'manual': '手動終了' }
                  return (
                    <button key={r} onClick={() => setExitReason(r)} className={`chip ${exitReason === r ? 'selected' : ''}`}>
                      {labels[r]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                決済価格（USD）<span style={{ fontSize: 11 }}>　エントリー: ${closeModal.entryPrice.toFixed(2)}</span>
              </label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="例: 489.50"
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setCloseModal(null)}>キャンセル</button>
              <button className="btn btn-primary btn-full" onClick={handleClose} disabled={!exitPrice}>決済を確定する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
