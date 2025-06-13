# TODO リスト

BetNote の Supabase 化に向けた具体的なチケット一覧です。各項目を完了したらチェックを入れてください。

## フェーズ 0: 準備
- [x] Supabase プロジェクトを作成して URL と API キーを取得
- [x] GitHub リポジトリと Vercel プロジェクトを連携
- [x] `supabase` CLI をセットアップし `supabase init` する

## フェーズ 1: DB 設計
- [ ] `profiles` テーブルを定義 (id, email, display_name など)
- [ ] `bet_entries` テーブルを定義 (user_id, date, race_name など)
- [ ] Row Level Security を有効化しポリシーを作成
- [ ] `supabase db push` でスキーマをデプロイ

## フェーズ 2: 認証基盤
- [ ] `@supabase/supabase-js` を依存に追加
- [ ] Server / Browser クライアントを提供する `SupabaseProvider` を実装
- [ ] OAuth (Google, Apple) とメールリンク認証を設定
- [ ] `/dashboard` ルートを Middleware で保護

## フェーズ 3: CRUD 移行
- [ ] `useBetEntries` フックを Supabase API 版に刷新
- [ ] Server Actions で `insert`, `update`, `delete` を実装
- [ ] リアルタイムリスナーでクライアントを同期

## フェーズ 4: データ移行
- [ ] `localStorage` から Supabase へ一括アップロードするスクリプトを作成
- [ ] 移行完了後、ローカルデータを削除

## フェーズ 5: ストレージ (任意)
- [ ] 画像アップロード API と Storage バケットを用意
- [ ] アップロードした画像を署名付き URL で表示

## フェーズ 6: CI/CD
- [ ] Vercel の環境変数に Supabase キー類を設定
- [ ] Preview と Production の環境を分離
- [ ] `git push` による自動デプロイを確認

## フェーズ 7: QA / テスト
- [ ] Vitest または Jest でユニットテストを追加
- [ ] Playwright で E2E テストを作成
- [ ] Supabase Studio で実データの検証

## フェーズ 8: 追加 UX
- [ ] テーブル仮想化 / ページネーション導入
- [ ] CSV インポートや ROI ヒートマップなど分析機能を拡充

---
状況に応じてタスクを追加・更新してください。
