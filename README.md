# AI研究会 インフラツール

AI研究会の活動管理を行うWebアプリケーションです。

## 🔗 アクセス方法

### ローカル環境
- 初回gitクローン後`app/.env.local` を作成:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ACCESS_PASSWORD=kokuri-ai-club
```

- mainまたは指定されたツリーからブランチを切る
- 環境の統一
```bash
npm install
```

1. `app/` ディレクトリで `npm run dev` を実行
2. http://localhost:3000 にアクセス
3. git上にコミット＆プッシュ
4. 動作確認完了後プルリク作成


### 本番環境（Vercel）

- URL: [https://krc-ai-club-infrastructure.vercel.app/]
- パスワード: 

## 📦 機能一覧

| モジュール | 概要 |
|-----------|------|
| メンバー一覧 | クラブメンバー一覧・プロジェクト参加率 |
| プロジェクト一覧 | 進行中プロジェクト一覧 |
| プロジェクト新規作成 | プロジェクト基本情報・詳細設定・チームメンバ |
| プロジェクト詳細 | 優先タスクリスト・バーンダウンチャート・参加メンバ・活動ログ |
| タスク管理 | カンバンボード（Jira,Notionイメージ）|
| LT管理 | ライトニングトークの予定・実績管理 |
| クラブ運営管理 | 出席管理・活動記録|
| ユーザ登録 | 管理者のみクラブメンバ登録 |

## 🛠️ 技術構成

- **フロントエンド**: Next.js (App Router)
- **バックエンド / DB**: Supabase (PostgreSQL)
- **ホスティング**: Vercel

### 開発サーバー起動

```bash
npm run dev
```

