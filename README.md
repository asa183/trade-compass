# Trade Compass

Trade Compassは、現在の市場レジーム（相場環境）やVIXなどの変動リスク、そしてユーザー個人の特性（投資スタイルやリスク耐性）を多角的に分析し、AIがパーソナライズされた取引ディールやバスケットを提案する次世代の投資サポート・オンボーディングプラットフォームです。

## 🚀 テクノロジースタック
- **フロントエンド・フレームワーク**: [Next.js](https://nextjs.org/) (App Router, Turbopack対応)
- **状態管理**: Zustand
- **データベース & 認証**: [Supabase](https://supabase.com/)
- **AI / LLM**: Vercel AI SDK + OpenAI API (`gpt-4o`)
- **金融データ取得**: `yahoo-finance2` (S&P500, VIXなどのリアルタイムデータ)
- **スタイリング**: Vanilla CSS + カスタムユーティリティクラス

---

## ⚙️ 必須の環境変数

プロジェクトを正しく実行するためには、以下の環境変数を設定する必要があります。プロジェクトルートに `.env.local` を作成し、設定してください。

```env
# Supabase settings
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# AI engine (OpenAI)
OPENAI_API_KEY="your-openai-api-key"
```

## 🛠️ 環境別のセットアップ方法

### 1. ローカル開発環境 (Local Development)

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスするとアプリが確認できます。リアルタイムの市場データと動的AIスコアリングをローカル環境で検証可能です。

### 2. Render でのデプロイ (推奨環境の1つ)

このプロジェクトは [Render](https://render.com/) でのホスティングに対応しています。

1. Renderのダッシュボードで `New Web Service` を作成
2. このGitHubリポジトリを接続
3. 以下のように基本設定を行います：
   - **Environment**: `Node`
   - **Node.js Version**: `20` 以上を推奨（環境変数 `NODE_VERSION: 20` の設定が有効）
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables** (環境変数) の設定画面に移動し、上記の `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`OPENAI_API_KEY` をシークレットとして登録。
5. デプロイを実行

### 3. Vercel でのデプロイ

Next.jsの開発元である [Vercel](https://vercel.com/) では最も簡単にデプロイが可能です。

1. Vercelダッシュボードから `Add New Project`
2. 対象のリポジトリをインポート
3. **Environment Variables** に必要な環境変数を追加
4. `Deploy` ボタンをクリック

VercelではEdge FunctionsやServerless Functionsが自動的に最適化され、AIエンドポイントへのリクエストもスムーズに行われます。

---

## 📂 Supabase のデータベース構成について
APIを正常に動作させるため、Supabase上に以下のテーブルを構築しておく必要があります。
- `profiles`: ユーザーの投資経験やリスク許容度などのオンボーディング情報
- `baskets`: 推奨する取引テーマ（コア指数、セクター等）
- `paper_trades`: 模擬取引（ペーパートレード）の履歴と状態
- `deal_reviews`: 実行済みディールに対する振り返り内容
- `skip_reviews`: 見送ったディールに対する理由の記録

データベースのエクスポート定義やシードデータ更新は、`scripts/` 以下のファイル群をご参照ください。

---

## 📋 開発時の注意点・アーキテクチャ
- **AIスコアリングの動的化**: 確信度（Confidence Score）は静的なデータベースの値に依存せず、常に `lib/scoring.ts` を通じて「市場レジーム」「モメンタム」「VIXボラティリティ」のリアルタイム変動をもとに計算されます。
- **UIとの分離**: AIの推論や重いAPI通信（yahoo-finance等）は `/api/engine/` エンドポイントで処理され、フロントエンド側にはキャッシュされた軽量なサマリーをZustandを通じて提供する設計となっています。（現在は`revalidate = 3600`でAPIコールを節約）
