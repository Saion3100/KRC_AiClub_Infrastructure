# AI研究会 エンタープライズ管理

プロジェクト・タスク・メンバー情報をひとつの管理画面で扱う社内向けアプリです。[Next.js](https://nextjs.org)（App Router）と[Supabase](https://supabase.com)で構築しています。

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクト直下に `.env.local` を作成し、以下を設定します。

```bash
# Supabaseプロジェクトの接続情報（クライアント/サーバー共通）
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ログイン・会員登録など、サーバー側だけで使う機密情報
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=replace-with-a-long-random-string
```

- `SUPABASE_SERVICE_ROLE_KEY` と `AUTH_SECRET` は絶対にクライアントに漏らさないでください（`NEXT_PUBLIC_` を付けない）。
- `AUTH_SECRET` はセッションCookieの署名に使う秘密鍵です。長いランダム文字列を設定してください。

### 3. Supabase側のテーブル作成

`supabase/auth-users-roles.sql` をSupabaseのSQLエディタで実行し、`users` テーブル（ログイン用）とロール関連の設定を作成します。

その他のテーブル定義は `supabase/schema-next-draft.sql` を参照してください（今後追加予定のテーブルを含む下書きです）。

### 4. 管理者ユーザーの作成

ログイン画面から新規登録すると `users.app_role = 'member'` で作成されます。管理者に昇格させるには、Supabase上で直接SQLを実行します。

```sql
UPDATE users SET app_role = 'admin' WHERE email = 'admin@example.com';
```

パスワードハッシュを手動で発行したい場合は次のコマンドを使います。

```bash
npm run hash-password -- "your-password"
```

## 開発

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番ビルドの起動
npm run lint     # ESLint実行
```

## ページ構成（画面遷移）

ログイン後は認証必須の共通レイアウト配下に、画面ごとに実ルートが分かれています。

```
/login                       # 未ログイン時のログイン・新規登録画面
/dashboard                   # ログイン後のトップ
/projects                    # プロジェクト一覧
/projects/new                # プロジェクト新規作成
/projects/[projectId]        # プロジェクト詳細
/tasks                       # タスク一覧（カンバン、?projectId= で作成フォームの初期選択を指定可能）
/members                     # メンバー一覧
/members/new                 # メンバー追加
/members/[userId]            # メンバー詳細
/lt                          # LT一覧
/lt/new                      # LT新規作成
/notices                     # 連絡事項
```

対応するファイルは `app/(main)/` 配下に画面ごとのフォルダとして置かれています（`(main)` はURLに出ないroute groupで、共通のサイドバー・ヘッダーは `app/(main)/layout.tsx` にまとまっています）。

## 認証の仕組み

- Supabaseの `users` テーブルに保存した `password_hash`（scrypt）とメールアドレスで照合します（`app/lib/auth.ts`）。
- ログインに成功すると、署名付きセッション情報をHTTP Only Cookieに保存します（`AUTH_SECRET` で署名）。
- 各ページ・Server Actionは `requireAuth()` を通してログイン状態を確認し、未ログインなら `/login` へリダイレクトします。

## 既知の制限事項

- 「メンバー追加」（`/members/new`）と「LT新規作成」（`/lt/new`）のフォームは、現状Supabaseへの保存処理が未実装です（`app/lib/actions.ts` の `createMemberAction` / `createLtAction`）。
- ダッシュボードのカンバン表示・進捗管理・稼働状況、LT一覧の表示は、対応するテーブル（`project_progress_snapshots` / `lt_talks` など）が未接続のためプレースホルダー表示です。
