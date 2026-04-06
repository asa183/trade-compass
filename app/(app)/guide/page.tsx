'use client'

import { useState } from 'react'
import {
  ChevronDown, ChevronUp,
  LayoutDashboard, TrendingUp, Layers, History, BarChart2,
  BookOpen, Zap, Shield, Star, CheckCircle, AlertTriangle,
  ArrowRight, Info, Clock, User,
} from 'lucide-react'

/* =====================================================
   型 & データ定義
===================================================== */
interface Section {
  id: string
  icon: React.ElementType
  color: string
  bg: string
  title: string
  subtitle: string
  steps: {
    emoji?: string
    heading: string
    body: string | string[]
    tip?: string
    warn?: string
  }[]
}

const SECTIONS: Section[] = [
  {
    id: 'concept',
    icon: BookOpen,
    color: 'var(--accent)',
    bg: 'var(--accent-dim)',
    title: 'アプリの考え方',
    subtitle: '何のためのアプリなのか',
    steps: [
      {
        emoji: '🎯',
        heading: 'このアプリは「儲かる銘柄を当てる」ためのものではありません',
        body: '目的は、あなたの投資判断そのものを改善することです。結果ではなく、「なぜその判断をしたか」「感情は冷静だったか」「ルールを守れたか」を記録・分析します。',
      },
      {
        emoji: '🔄',
        heading: '5つのサイクルで判断力を磨く',
        body: [
          '① 市場を読む　→　今がどんな局面かを把握する',
          '② 戦略を知る　→　自分に合ったバスケットを選ぶ',
          '③ 模擬で試す　→　仮想資金でリスクなく練習する',
          '④ 短く振り返る　→　感情・ルール・結果を記録する',
          '⑤ 数字で改善する　→　ダッシュボードで傾向を確認する',
        ],
      },
      {
        emoji: '🛡️',
        heading: '自動売買は一切ありません',
        body: '実際の売買の最終判断は、常にあなた自身が行います。このアプリは「通知・示唆・模擬」に徹します。',
        tip: 'まずは模擬ディールで十分に練習することを強く推奨します。',
      },
    ],
  },
  {
    id: 'home',
    icon: LayoutDashboard,
    color: 'var(--accent)',
    bg: 'var(--accent-dim)',
    title: 'ホーム画面',
    subtitle: '今日の状況をひと目で把握する',
    steps: [
      {
        emoji: '📊',
        heading: '市場レジームカード',
        body: '画面上部に表示される「〇〇局面」が現在の市場状態です。追い風・逆風・注目ポイントで今日の要点を掴みましょう。',
        tip: '「市場」タブでさらに詳しい指標（VIX・金利・セクター強度）を確認できます。',
      },
      {
        emoji: '⚡',
        heading: '今日の推奨アクション',
        body: '市場レジームに応じた具体的な行動提案がここに表示されます。「具体的な行動ヒント」をタップすると詳細が展開されます。',
      },
      {
        emoji: '🗂️',
        heading: '注目バスケット',
        body: '現在の市場環境に合うETFバスケットのショートリストです。タップするとバスケット詳細画面に遷移します。',
      },
      {
        emoji: '📋',
        heading: '新着ディールカード',
        body: 'バスケットより具体的なエントリー提案です。「実行適合スコア」はあなたの特性との相性を示しています。',
        warn: '「見送り推奨」が表示されている時は、エントリーを焦らず見送ることが最善策です。',
      },
      {
        emoji: '📝',
        heading: '振り返り待ち',
        body: '模擬ディールが終了すると、ここに振り返り通知が届きます。緑のバッジが表示されたら、20秒ライトレビューを完了しましょう。',
      },
    ],
  },
  {
    id: 'market',
    icon: TrendingUp,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    title: '今日の市場',
    subtitle: '相場環境を多角的に読む',
    steps: [
      {
        emoji: '📈',
        heading: '主要指数',
        body: 'S&P500・Nasdaq100・Russell2000の直近終値と前日比を確認できます。3指数すべての方向感を見ることで、「広い相場」か「一部のみ強い相場」かを判断できます。',
      },
      {
        emoji: '🌡️',
        heading: '市場レジーム詳細スコア',
        body: [
          '追い風スコア：買いに有利な材料がどれだけあるか',
          'リスクスコア：市場の不確実性・警戒度（高いほど慎重に）',
          '過熱感スコア：相場が行き過ぎていないか（高いと天井圏注意）',
          'トレンドスコア：上昇の継続性の強さ',
          'タイミングスコア：今この瞬間のエントリー適性',
        ],
        tip: '5スコアすべてが良好な時が「最高の環境」です。1〜2つ悪くても普通の状態です。',
      },
      {
        emoji: '📉',
        heading: 'マクロ指標の見方',
        body: [
          'VIX 18未満 → 市場は落ち着いている（エントリーしやすい）',
          'VIX 25以上 → 高ボラ警戒（ポジションサイズ縮小を検討）',
          '米10年債 4.0%未満 → 成長株・テクノロジー株に追い風',
          '200MA上比率 60%以上 → 市場内部が健全（買いに向いた環境）',
        ],
      },
      {
        emoji: '📅',
        heading: '重要イベントカレンダー',
        body: '今後の米国重要指標（CPI・FOMC等）の日程です。「重要」マークのイベント前後は価格変動が大きくなります。新規エントリーはイベント通過後に検討するのが基本です。',
        warn: '赤い「重要」バッジのイベント前は、ポジションを軽くするか見送りを推奨します。',
      },
    ],
  },
  {
    id: 'baskets',
    icon: Layers,
    color: 'var(--success)',
    bg: 'var(--success-dim)',
    title: 'バスケット',
    subtitle: 'ETFで市場テーマに乗る',
    steps: [
      {
        emoji: '🗂️',
        heading: 'バスケットとは何か',
        body: '関連するETFをひとまとめにした「投資テーマのパッケージ」です。個別株の銘柄選びをスキップして、市場の流れ（セクター・スタイル）に乗れるよう設計されています。',
      },
      {
        emoji: '📦',
        heading: '4つのカテゴリ',
        body: [
          'コア指数型：SPY・QQQなど市場全体に乗るベーシック戦略',
          'スタイル型：成長株 vs 割安株など特性で選ぶ',
          'セクター型：テクノロジー・ヘルスケアなどテーマに集中',
          '防御型：ボラが高い局面で安定性を優先する戦略',
        ],
        tip: '初心者はまずコア指数型（SPY・QQQ）から練習することを推奨します。',
      },
      {
        emoji: '🎯',
        heading: '確信度スコアとは',
        body: '現在の市場環境とバスケットの前提が「どれだけ一致しているか」を示すスコアです。75%以上が高い確信度、60%未満は条件が整っていない状態です。',
        warn: '確信度が低くても「面白そう」という感覚でエントリーするのは危険です。',
      },
      {
        emoji: '📖',
        heading: 'エントリー・利確・損切り条件の展開',
        body: 'バスケット詳細画面の「エントリー・利確・損切り条件」セクションをタップすると、具体的な実行基準が表示されます。必ず一読してからディールに進んでください。',
      },
    ],
  },
  {
    id: 'deals',
    icon: Layers,
    color: 'var(--warning)',
    bg: 'var(--warning-dim)',
    title: 'ディールカード',
    subtitle: '具体的なエントリー提案を評価する',
    steps: [
      {
        emoji: '🃏',
        heading: 'ディールカードとは',
        body: 'バスケットよりさらに具体的な「今日のエントリー候補」です。エントリー条件・利確ライン・損切りライン・保有期間がすべて記載されています。',
      },
      {
        emoji: '🧩',
        heading: '実行適合スコアの読み方',
        body: [
          '市場適合スコア：現在の市場環境とこのディールの相性（0〜100）',
          'あなた適合スコア：あなたの特性・コンディションとの相性（0〜100）',
          '推奨サイズ：「標準実行可」「小さめ推奨」「模擬推奨」「見送り推奨」の4段階',
        ],
        tip: '両スコアが70以上の時が最も理想的なエントリー環境です。',
      },
      {
        emoji: '✅',
        heading: '実行前チェックリスト（必須）',
        body: '「このディール内容を理解した」「リスクは許容範囲内」「今の感情は冷静」の3つにチェックが入らないと模擬開始ボタンが押せません。形式的にではなく、本当に確認してください。',
        warn: '感情が「興奮」や「焦り」になっている時は、チェックを押さずに見送りましょう。',
      },
      {
        emoji: '⏭️',
        heading: '見送りも記録する',
        body: '「今回は見送る」ボタンを押すと、見送りが記録されます。後日このディールの結果を確認し、「見送って正解だったか」を振り返ることができます。長期的な判断力強化につながります。',
      },
    ],
  },
  {
    id: 'paper',
    icon: Shield,
    color: 'var(--accent)',
    bg: 'var(--accent-dim)',
    title: '模擬ディール',
    subtitle: 'リスクなしで戦略を練習する',
    steps: [
      {
        emoji: '🎮',
        heading: '模擬ディールとは',
        body: '仮想資金（デフォルト50万円）を使って、本番さながらの投資練習ができる機能です。実際の資金は一切動きません。',
        tip: '実運用に移行する前に、最低30件の模擬ディールを推奨します。',
      },
      {
        emoji: '▶️',
        heading: '模擬ディールの開始方法',
        body: [
          '① ディール詳細画面で3つのチェックを入れる',
          '② 「模擬で試す」ボタンをタップ',
          '③ 仮想投資額を入力（デフォルト50万円）',
          '④ 「開始する」をタップ',
        ],
      },
      {
        emoji: '🔴',
        heading: '模擬ディールのクローズ方法',
        body: [
          '① 「模擬ディール」タブ → 進行中のディールを確認',
          '② 「クローズ（手動終了）」ボタンをタップ',
          '③ 終了理由（利確 / 損切り / 手動終了）を選択',
          '④ 終了価格（USD）を入力して「終了する」',
        ],
        warn: '実際のチャートを確認して現在価格を入力してください。アプリは自動で価格を取得しません。',
      },
      {
        emoji: '📊',
        heading: '損益の計算',
        body: '終了価格 ÷ エントリー価格 − 1 で計算されます。たとえばエントリー500ドル、終了520ドルなら +4.0% です。仮想投資額50万円なら +2万円の結果となります。',
      },
    ],
  },
  {
    id: 'reviews',
    icon: History,
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.12)',
    title: '振り返り',
    subtitle: '結果ではなく判断の質を評価する',
    steps: [
      {
        emoji: '⏱️',
        heading: 'ライトレビュー（20秒）',
        body: '模擬ディールが終了すると、自動で振り返り依頼が届きます。4つの質問（実行したか・納得感・感情・ルール遵守）に答えるだけで完了です。',
        tip: '「完璧な答え」は求めていません。素直な感覚を記録することが大切です。',
      },
      {
        emoji: '⭐',
        heading: '納得感スコア（星1〜5）',
        body: '結果（損益）の良し悪しに関わらず、「その判断にどれだけ納得しているか」を記録します。勝っても雑な判断は星1、負けても丁寧な判断は星5をつけましょう。',
      },
      {
        emoji: '😌',
        heading: '感情記録の意味',
        body: 'ダッシュボードで「冷静時の勝率」「不安時の勝率」「興奮時の勝率」が比較されます。感情別の成績差がわかると、「この感情状態の時はエントリーしない」というルール作りができます。',
      },
      {
        emoji: '📏',
        heading: 'ルール遵守の記録',
        body: '「エントリー条件を満たしていたか」「損切りラインを守ったか」を記録します。ルールを守った時の勝率・守れなかった時の勝率の差がダッシュボードに反映されます。',
        warn: 'ルール逸脱を責める必要はありません。改善データとして記録するだけで十分です。',
      },
    ],
  },
  {
    id: 'dashboard',
    icon: BarChart2,
    color: 'var(--success)',
    bg: 'var(--success-dim)',
    title: 'ダッシュボード',
    subtitle: '数字と示唆で判断を改善する',
    steps: [
      {
        emoji: '💡',
        heading: '今週の示唆',
        body: '振り返りデータから自動生成される改善ヒントです。「緑＝良い傾向」「黄＝注意」のカラーコードで現状を示します。',
        tip: '示唆は毎週更新されます。1件ずつ読んで実際の行動に反映させましょう。',
      },
      {
        emoji: '📈',
        heading: 'パフォーマンス指標の読み方',
        body: [
          '勝率：50%以上が一般的な目標。55%以上は良好',
          'リスクリワード (RR)：1.5以上が目標。勝率が低くてもRRが高ければ期待値はプラスになる',
          '期待値：1トレードあたりの期待リターン。プラスなら継続可能な戦略',
          '最大ドローダウン：資産が最大でどれだけ落ちたか。-15%以内が目安',
        ],
      },
      {
        emoji: '🧠',
        heading: '行動品質スコア',
        body: [
          'ルール遵守率：75%以上が目標。低いならエントリー根拠を再確認',
          '見送り判断率：適切な見送りができているか（20%以上が目安）',
          '飛び乗り率：FOMOによる衝動エントリー。15%以下が目標',
          '損切り遅延率：損切りを引き延ばす傾向。10%以下が目標',
        ],
      },
      {
        emoji: '🏁',
        heading: '実運用準備度チェック',
        body: '4つの条件をすべてクリアすると、実運用向けの通知モードに移行できます。焦らず、模擬ディールで十分なデータを積み上げてください。',
        warn: '準備度チェックをすべて満たす前に実運用を始めることは推奨しません。',
      },
    ],
  },
  {
    id: 'tips',
    icon: Star,
    color: 'var(--warning)',
    bg: 'var(--warning-dim)',
    title: '上手な使い方のコツ',
    subtitle: '長く続けるためのヒント',
    steps: [
      {
        emoji: '📅',
        heading: '毎日のルーティン（5分）',
        body: [
          '朝：ホーム画面で市場レジームと注目バスケットを確認',
          '米国株引け後：市場タブで指数・VIX・イベントを確認',
          '模擬終了後：すぐに振り返りを完了する（記憶が新鮮なうちに）',
        ],
      },
      {
        emoji: '🚦',
        heading: '「見送り推奨」は従う',
        body: '実行適合スコアが「見送り推奨」を示している時は、感情に流されずに従いましょう。見送りの記録もダッシュボードに反映され、良い判断として評価されます。',
        tip: '「見送った日のダッシュボード改善率」を確認すると、見送りの価値がわかります。',
      },
      {
        emoji: '🎯',
        heading: '1度に1〜2つのバスケットに集中',
        body: '多くのバスケットに分散しすぎると、振り返りが難しくなります。最初は1〜2つのバスケットに絞って、パターンを学ぶことが上達の近道です。',
      },
      {
        emoji: '📉',
        heading: '損失が続いた時の対応',
        body: [
          '3連敗したら、模擬ディールを一時停止する',
          'ダッシュボードの「今週の示唆」を確認する',
          '市場環境が変わっていないか「今日の市場」で確認する',
          '感情状態に問題がないか振り返りデータを見直す',
        ],
        warn: '損失中に「取り返そう」とポジションを増やすのは最も危険な行動です。',
      },
      {
        emoji: '🔔',
        heading: '通知の活用',
        body: '重要な市場イベント・ディール期限・振り返り促進の通知が届きます。通知に記載された「次の行動」リンクをタップすると、すぐに該当ページに遷移できます。',
      },
    ],
  },
]

/* =====================================================
   コンポーネント
===================================================== */

function AccordionSection({ section }: { section: Section }) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = section.icon

  return (
    <div style={{
      border: `1px solid ${isOpen ? section.color + '44' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    }}>
      {/* ヘッダー */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px',
          background: isOpen ? section.bg : 'var(--bg-card)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
          transition: 'background 0.2s ease',
        }}
      >
        {/* アイコン */}
        <div style={{
          width: 40, height: 40,
          borderRadius: 12,
          background: section.bg,
          border: `1px solid ${section.color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} color={section.color} />
        </div>

        {/* テキスト */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {section.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {section.subtitle}
          </div>
        </div>

        {/* シェブロン */}
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {isOpen
            ? <ChevronUp size={18} color={section.color} />
            : <ChevronDown size={18} />
          }
        </div>
      </button>

      {/* コンテンツ */}
      {isOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderTop: `1px solid ${section.color}22`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>
          {section.steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: '16px',
                borderBottom: i < section.steps.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {/* ステップヘッダー */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                {step.emoji && (
                  <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{step.emoji}</span>
                )}
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {step.heading}
                </span>
              </div>

              {/* 本文 */}
              {typeof step.body === 'string' ? (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: step.emoji ? 28 : 0 }}>
                  {step.body}
                </p>
              ) : (
                <ul style={{ paddingLeft: step.emoji ? 28 : 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {step.body.map((line, li) => (
                    <li key={li} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, listStyle: 'none' }}>
                      {line}
                    </li>
                  ))}
                </ul>
              )}

              {/* Tip */}
              {step.tip && (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  marginTop: 10,
                  padding: '8px 12px',
                  background: 'var(--success-dim)',
                  border: '1px solid rgba(74,186,135,0.2)',
                  borderRadius: 8,
                }}>
                  <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--success)', lineHeight: 1.6 }}>{step.tip}</span>
                </div>
              )}

              {/* Warning */}
              {step.warn && (
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  marginTop: 10,
                  padding: '8px 12px',
                  background: 'var(--warning-dim)',
                  border: '1px solid rgba(232,167,43,0.2)',
                  borderRadius: 8,
                }}>
                  <AlertTriangle size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--warning)', lineHeight: 1.6 }}>{step.warn}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =====================================================
   ページ本体
===================================================== */

export default function GuidePage() {
  const [allOpen, setAllOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ヘッダー */}
      <div style={{ paddingTop: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px',
          background: 'var(--accent-dim)',
          border: '1px solid rgba(91,138,244,0.2)',
          borderRadius: 'var(--radius-full)',
          marginBottom: 10,
        }}>
          <BookOpen size={12} color="var(--accent)" />
          <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>使い方ガイド</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>
          Trade Compass<br />使い方マニュアル
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          各セクションをタップして詳細を確認してください。
          まずは「アプリの考え方」から読むことをおすすめします。
        </p>
      </div>

      {/* クイックナビ */}
      <div style={{
        padding: '14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          <Zap size={11} style={{ display: 'inline', marginRight: 4 }} />
          クイックスタート（5分で開始）
        </div>
        {[
          { step: '1', text: 'ホーム画面で市場レジームを確認', color: 'var(--accent)' },
          { step: '2', text: 'バスケット一覧で興味あるETFを探す', color: 'var(--success)' },
          { step: '3', text: 'ディールカードを開いてチェックを入れる', color: 'var(--warning)' },
          { step: '4', text: '「模擬で試す」で仮想トレードを開始', color: '#a78bfa' },
          { step: '5', text: '終了後に20秒振り返りを完了する', color: '#f472b6' },
        ].map(({ step, text, color }) => (
          <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: color + '22', border: `1px solid ${color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800, color, flexShrink: 0,
            }}>
              {step}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* セクション一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SECTIONS.map((section) => (
          <AccordionSection key={section.id} section={section} />
        ))}
      </div>

      {/* よくある質問 */}
      <div style={{
        padding: '14px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <Info size={14} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>よくある質問</span>
        </div>

        {[
          {
            q: '実際のお金は動きますか？',
            a: '模擬ディール中は動きません。実際の売買はすべて証券口座で手動で行う必要があります。',
          },
          {
            q: 'データはいつ更新されますか？',
            a: '市場データは米国市場引け後（日本時間の翌朝）に更新されます。',
          },
          {
            q: '損失が出たらどうすればよいですか？',
            a: 'まず振り返りで原因を記録してください。3連敗したら一時停止し、ダッシュボードの「示唆」を確認してください。',
          },
          {
            q: 'いつ実運用に移行すべきですか？',
            a: 'ダッシュボードの「実運用準備度チェック」の4項目すべてをクリアしてから検討してください。',
          },
        ].map(({ q, a }, i) => (
          <div key={i} style={{ marginBottom: i < 3 ? 12 : 0, paddingBottom: i < 3 ? 12 : 0, borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Q. {q}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 14 }}>
              A. {a}
            </div>
          </div>
        ))}
      </div>

      {/* 免責 */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 8,
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          ⚠️ Trade Compassは投資判断の支援ツールです。将来の投資成果を保証するものではありません。
          実際の投資判断はご自身の責任で行ってください。
          元本割れのリスクがあることをご理解の上、ご利用ください。
        </p>
      </div>
    </div>
  )
}
