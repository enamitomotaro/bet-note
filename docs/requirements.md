# BetNote 要件概要

このドキュメントは、競馬の馬券収支を管理する Web アプリケーション **BetNote** の要件を整理したものです。本アプリは Next.js と Supabase を利用し、ユーザーは自身の馬券購入履歴を記録・分析できます。

## 目的

- 馬券購入の履歴を簡単に記録する
- 投資額や払戻額から損益・回収率を算出し、統計情報やグラフで可視化する
- モバイル・PC 双方で利用しやすい UI を提供する

## 主な機能

### 認証・セッション管理

- Supabase Authentication を用いたメールリンク認証や Google/Apple ログイン
- ログイン状態の保持は Supabase セッションをブラウザ Cookie で管理

### エントリー管理

- 日付、レース名、掛け金、払戻金を入力してエントリーを登録
- 登録済みエントリーの編集・削除
- 表形式での一覧表示（並び替え・検索・期間フィルタが可能）
- ダッシュボード上では最新数件を表示し、全件表示ページも用意
- リアルタイムチャンネルによる他デバイスとのデータ同期

### 統計・分析

- 総投資額、総払戻額、純利益、回収率、的中率、最高払戻額を自動計算
- 日次/週次/月次の損益グラフおよび累積損益グラフを表示
- 表示するカードの順序や期間フィルタを設定するダイアログを提供

### ユーザー設定

- `user_profiles` テーブルに保存された表示名・アバター URL の取得・更新 API

## データベース設計

Supabase 上に以下のテーブルを持つスキーマを利用します。詳細は [`docs/supabase_schema.md`](supabase_schema.md) を参照してください。

- **bet_entries**: 各ユーザーの馬券エントリーを記録。RLS により自身のデータのみ操作可能
- **user_profiles**: ユーザーの表示名・アバター情報を保持

## 使用技術

- **Next.js 15** / **React 18** / **TypeScript**
- **Supabase** (Auth, Database, Realtime)
- UI ライブラリとして **Shadcn UI** と **Tailwind CSS** を利用
- エラー監視に **Sentry** を使用（`src/utils/sentry.ts`）
- 開発環境では Stagewise Toolbar を表示

## 環境変数

- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY` など Supabase 関連のキーを `.env` に設定して利用

## 今後の拡張例

- さらなる統計指標の追加や通知機能の実装
- Supabase スキーマ変更時は `docs/supabase_schema.md` の更新を行う

