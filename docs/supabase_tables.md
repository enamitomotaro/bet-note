# Supabase テーブル定義

ここではアプリで利用する Supabase のテーブル定義をまとめます。コンソールから手動で作成する場合は以下を参考にしてください。

## bet_entries

ユーザーが登録した馬券購入履歴を保存するテーブルです。

| 列名 | 型 | 設定 | 説明 |
| --- | --- | --- | --- |
| id | uuid | primary key, default uuid_generate_v4() | レコードを一意に識別するID |
| user_id | uuid | not null, foreign key → auth.users(id) | エントリー所有ユーザー |
| date | date | not null | レース日 |
| race_name | text | not null, default '' | レース名 |
| stake | numeric | not null | 賭け金 |
| payout | numeric | not null, default 0 | 払戻金 |
| inserted_at | timestamp with time zone | default now() | 作成日時 |
| updated_at | timestamp with time zone | default now() | 更新日時 |

### 推奨設定
- 認可: Row Level Security (RLS) を有効にし、`user_id = auth.uid()` の行だけ読み書きできるポリシーを設定します。
- インデックス: `user_id` と `date` の複合インデックスを作成しておくと検索が高速になります。

以上が基本的なテーブル構成です。シンプルですが、本アプリの機能要件には十分でしょう。必要に応じて `race_name` の長さ制限を設定したり、分析用に別テーブルを追加することも検討できます。

## user_profiles

認証機能では Supabase の `auth.users` を利用しますが、追加情報を保持するために
独自のプロファイルテーブルを用意します。

| 列名 | 型 | 設定 | 説明 |
| --- | --- | --- | --- |
| id | uuid | primary key, references auth.users(id) | 認証ユーザー ID |
| display_name | text | not null, unique | 表示名 |
| avatar_url | text |  | プロフィール画像 URL |
| created_at | timestamp with time zone | default now() | 作成日時 |
| updated_at | timestamp with time zone | default now() | 更新日時 |

### 推奨設定
- RLS を有効にし、`id = auth.uid()` の行だけ読み書きできるポリシーを設定します。
- `display_name` にインデックスを貼って検索を高速化できます。
