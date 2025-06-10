# BetNote – 競馬収支管理 & 分析アプリ

**BetNote** は競馬の馬券収支を直感的に記録・可視化できるシングルユーザー向け Web アプリです。Next.js (App Router) を中心に **Tailwind CSS** と **shadcn/ui** コンポーネントでデザインされます。

---

## 主な機能

- **ダッシュボード** – 統計概要カード・損益チャート・最近のエントリー表を自由な順序でレイアウト
- **エントリー履歴** – 日付・レース名・金額をフィルタ／検索／ソートして一覧表示
- **モーダルフォーム** – 新規追加・編集・削除をダイアログで完結
- ROI / 純利益 / 的中率 など自動計算
- レスポンシブ対応（モバイルではハンバーガーメニューに集約）

## 技術スタック

| レイヤ             | 採用技術 |
|--------------------|-----------|
| Framework | **Next.js 15.2** (App Router, Turbopack)
| UI  | **React 18** + **TypeScript 5**  
| Styling | **Tailwind CSS 3** & `tailwindcss-animate`  
| Components | **shadcn/ui** (Radix UI + tailwind‑merge)
| Charts | **Recharts** – 損益グラフ
| Utilities | `uuid` (ID 生成), `date-fns` (日付処理)

## ディレクトリ構成

```text
root
├─ src
│  ├─ app               # Next.js アプリルート
│  │  ├─ dashboard      # 保護されたメイン画面
│  │  │  ├─ entries     # /dashboard/entries ページ
│  │  │  └─ layout.tsx  # ダッシュボード用レイアウト
│  │  ├─ globals.css    # Tailwind ベースと CSS 変数
│  │  └─ page.tsx       # ルート → /dashboard へリダイレクト
│  ├─ components        # UI / 機能コンポーネント
│  │  └─ ui             # shadcn/ui 派生コンポーネント
│  ├─ contexts          # React Context（ダイアログ状態管理）
│  ├─ hooks             # カスタムフック（LocalStorage・トースト等）
│  └─ lib               # 型定義・計算ロジック・ユーティリティ
└─ package.json         # スクリプトと依存パッケージ
```

## 主要コンポーネント

| ファイル | 役割 |
|----------|------|
| `AppHeader.tsx` | ロゴ・ナビゲーション・アクションボタン |
| `DashboardCards.tsx` | 総投資額など主要 6 指標を表示 |
| `ProfitChart.tsx` | 期間別 / 累積損益を日・週・月で可視化 |
| `EntriesTable.tsx` | 履歴テーブル（検索・ソート・集計フッター付き） |
| `EntryForm.tsx` | React Hook Form + Zod で検証 |

## セットアップ & 実行

```bash
# 1. クローン
git clone <repo-url>
cd betnote

# 2. 依存関係
npm install   # または yarn

# 3. 開発サーバー (ポート 9002)
npm run dev   # http://localhost:9002

# 4. 本番ビルド
npm run build
npm start
```

### よく使う npm スクリプト

| スクリプト | 説明 |
|------------|------|
| `dev` | Turbopack + ポート 9002 で開発サーバー |
| `build` | Next.js 静的/SSR ビルド |
| `start` | ビルド後の本番サーバー |
| `lint` | ESLint (`next lint`) |
| `typecheck` | 型チェックのみ (`tsc --noEmit`) |

## ローカルストレージ仕様

| キー名 | 用途 |
|--------|------|
| `betEntries` | エントリー配列 |
| `dashboardCardOrder_v2` | ダッシュボードのカード順序 |
| `dashboardStartDate_v1` / `dashboardEndDate_v1` | 日付フィルタ |

## ライセンス

MIT © 2025 BetNote Contributors
