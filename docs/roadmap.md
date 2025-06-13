# 開発ロードマップ

BetNote を Supabase + Vercel 上で本格的な SaaS として展開するためのタスクを整理します。各フェーズの完了条件を目安に進捗を管理してください。

## フェーズ 0: 準備
- Supabase プロジェクトの作成
- GitHub / Vercel 連携

## フェーズ 1: DB 設計
- `profiles` と `bet_entries` テーブルを SQL で定義
- Row Level Security を有効化し `auth.uid()` と一致する行のみ読み書き可能に
- `supabase db push` でスキーマを管理

## フェーズ 2: 認証基盤
- `@supabase/supabase-js` を追加
- Server/Browser クライアントをラップする `SupabaseProvider` を実装
- メールリンク認証と OAuth (Google/Apple) を有効化
- 認証後のみ `/dashboard` へアクセスできるよう Middleware を設定

## フェーズ 3: CRUD 移行
- `useBetEntries` フックを Supabase RPC/リアルタイムに置き換え
- Server Actions で `insert` / `update` / `delete` を実行
- クライアントではリスナーでリアルタイム更新を購読

## フェーズ 4: データ移行
- 既存 `localStorage` データを Supabase へ一括アップロードする util を作成
- 移行後にローカルデータをクリア

## フェーズ 5: ストレージ (任意)
- チケット画像やレシートをアップロードする API を追加
- 署名付き URL を使ってプレビューを表示

## フェーズ 6: CI/CD
- Vercel の環境変数を設定
- Preview 環境と Production 環境を分離
- `git push` で自動デプロイされることを確認

## フェーズ 7: QA / テスト
- Vitest/Jest でユニットテスト
- Playwright で E2E テスト
- Supabase Studio で実データを確認

## フェーズ 8: 追加 UX
- テーブルの仮想化やページネーションを導入し大量データにも対応
- CSV 取り込みやレースタグ付けなど分析機能を拡充

---

より詳細な検討や優先度の調整があればこのドキュメントを更新してください。
