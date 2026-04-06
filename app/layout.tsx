import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trade Compass — 投資判断支援アプリ',
  description: '市場を読む。自分に合う戦略を知る。模擬ディールで試す。短く振り返る。改善する。',
  keywords: ['US株', 'アメリカ株', '投資支援', 'ETF', '模擬ディール', '投資判断'],
  authors: [{ name: 'Trade Compass' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d1117',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
