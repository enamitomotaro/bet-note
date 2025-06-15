# Supabase スキーマ設計ドキュメント

このドキュメントは、Supabase プロジェクト上の現行スキーマ構成（テーブル、カラム、RLS ポリシー、トリガー、拡張機能など）をまとめたものです。

---

## プロジェクト情報

- プロジェクト ID: `cafkfygyimnrmotmdkkd`
- プロジェクト URL: `https://cafkfygyimnrmotmdkkd.supabase.co`

## 拡張機能

- uuid-ossp（UUID 自動生成用）

---

## テーブル定義

### 1. bet_entries

| 列名        | 型                         | 制約                                    | 説明            |
| ----------- | -------------------------- | --------------------------------------- | --------------- |
| id          | `uuid`                     | PRIMARY KEY, DEFAULT uuid_generate_v4() | レコード一意 ID |
| user_id     | `uuid`                     | NOT NULL, FK → auth.users(id)           | 所有ユーザー    |
| date        | `date`                     | NOT NULL                                | レース日        |
| race_name   | `text`                     | NOT NULL, DEFAULT ''                    | レース名        |
| stake       | `numeric`                  | NOT NULL                                | 賭け金          |
| payout      | `numeric`                  | DEFAULT NULL                            | 払戻金 (未確定は NULL) |
| inserted_at | `timestamp with time zone` | DEFAULT now()                           | 作成日時        |
| updated_at  | `timestamp with time zone` | DEFAULT now(), トリガーで自動更新       | 更新日時        |

#### インデックス

- `idx_bet_entries_user_id_date` (user_id, date)

#### 外部キー

- `user_id` → `auth.users(id)`

#### RLS（行レベルセキュリティ）

- ポリシー名: `Allow users to manage their own entries`
  - 権限: ALL
  - USING: `auth.uid() = user_id`
  - WITH CHECK: `auth.uid() = user_id`

#### トリガー／関数

- 関数: `public.update_timestamp()`

  - 概要: レコード更新時に `updated_at` を現在時刻に自動設定

- トリガー: `update_timestamp_trigger` on `public.bet_entries`
  - BEFORE UPDATE → `public.update_timestamp()`

---

### 2. user_profiles

| 列名         | 型                         | 制約                              | 説明                 |
| ------------ | -------------------------- | --------------------------------- | -------------------- |
| id           | `uuid`                     | PRIMARY KEY, FK → auth.users(id)  | 認証ユーザー ID      |
| display_name | `text`                     | NOT NULL, UNIQUE                  | 表示名               |
| avatar_url   | `text`                     | (NULL 可)                         | プロフィール画像 URL |
| created_at   | `timestamp with time zone` | DEFAULT now()                     | 作成日時             |
| updated_at   | `timestamp with time zone` | DEFAULT now(), トリガーで自動更新 | 更新日時             |

#### インデックス

- `idx_user_profiles_display_name` (display_name)

#### 外部キー

- `id` → `auth.users(id)`

#### RLS（行レベルセキュリティ）

- ポリシー名: `Allow users to manage their own profile`
  - 権限: ALL
  - USING: `auth.uid() = id`
  - WITH CHECK: `auth.uid() = id`

#### トリガー／関数

- トリガー: `update_timestamp_trigger` on `public.user_profiles`
  - BEFORE UPDATE → `public.update_timestamp()`

---

※ 将来的にテーブル追加やビジネスロジック実装時は、このドキュメントに追記してください。
