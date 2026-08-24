# Todo API

Node.js (Express) + PostgreSQL (Prisma) + MongoDB (Socket.io) で構築した、ToDo管理・リアルタイムチャット・定期ジョブ機能を持つバックエンドAPIです。

フロントエンド(React)はこちら: https://github.com/mika-t67/todo-frontend

## 実装した機能一覧

| No. | 機能 | 内容 |
|---|---|---|
| 1 | API開発 | Express + JWT認証 + CRUD + バリデーション + エラーハンドリング |
| 2 | DB操作 | PostgreSQL(Prisma ORM)、User/Task 2テーブル、CRUD、Jest単体テスト |
| 3 | セキュリティ実装 | helmet、express-rate-limit、bcryptパスワードハッシュ化、.env管理 |
| 4 | フロントエンド連携 | React(別リポジトリ)とREST APIで連携 |
| 5 | スケジュールタスク管理 | node-cronで毎分実行、実行ログ記録、失敗時リトライ、モニタリングAPI |
| 6 | リアルタイム機能 | Socket.io + JWT認証 + MongoDB(Atlas)に履歴保存、複数同時接続対応 |

## システム構成

### ER図

```mermaid
erDiagram
    User ||--o{ Task : "has many"}
    User {
        int id PK
        string email UK
        string password
        datetime createdAt
    }
    Task {
        int id PK
        string title
        string description
        string status
        datetime dueDate
        datetime createdAt
        datetime updatedAt
        int userId FK
    }
    TaskJobLog {
        int id PK
        string status
        string message
        int checkedCount
        datetime runAt
    }
```

補足: `TaskJobLog` は User / Task と直接の外部キー関係を持たない独立したログテーブルのため、ER図上ではリレーションを設定していません。


### アーキテクチャ図

```mermaid
graph TB
    subgraph Client["クライアント"]
        React["React (Vite)<br/>localhost:5173"]
    end

    subgraph Server["todo-api サーバー (localhost:3000)"]
        Express["Express<br/>REST API"]
        SocketIO["Socket.io<br/>リアルタイムチャット"]
        Cron["node-cron<br/>定期ジョブ(毎分)<br/>期限切れ間近タスクを検出"]
    end

    subgraph DB["データストア"]
        Postgres[("PostgreSQL (Prisma)<br/>User / Task / TaskJobLog")]
        Mongo[("MongoDB Atlas<br/>ChatMessage")]
    end

    React -- "REST API (JWT認証)" --> Express
    React -- "Socket.io (JWT認証)" --> SocketIO
    Express -- "Prisma ORM" --> Postgres
    Cron -- "タスクを検索" --> Postgres
    Cron -- "実行結果をログとして記録" --> Postgres
    Express -- "ログ取得API" --> Postgres
    SocketIO -- "Mongoose" --> Mongo
```

- Node.js / Express
- PostgreSQL(Prisma ORM 7系、ローカルは `prisma dev` で起動)
- MongoDB Atlas(チャット履歴保存用)
- Socket.io(リアルタイムチャット)
- node-cron(定期ジョブ)
- JWT(jsonwebtoken)、bcrypt(パスワードハッシュ化)
- helmet、express-rate-limit(セキュリティ)
- Jest、Supertest(テスト)

## システム構成


## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/mika-t67/todo-api.git
cd todo-api
npm install
```

### 2. PostgreSQL(Prisma dev)を起動

別ターミナルを開いて以下を実行し、**起動したまま**にしておいてください。

```bash
npx prisma dev
```

起動すると `DATABASE_URL` が表示されます。

### 3. MongoDB Atlasの準備

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) で無料アカウント・無料クラスター(M0)を作成
2. Database Access でユーザーを作成
3. Network Access で `0.0.0.0/0`(どこからでも接続可)を許可
4. 「Connect」→「Drivers」から接続文字列を取得

> 補足: Windows環境で `mongodb+srv://` 形式のSRV接続がDNSエラー(`querySrv ECONNREFUSED`)になる場合があります。その場合は「SRV接続ストリング」をオフにして、標準形式(`mongodb://host1,host2,host3/...`)の接続文字列を使用してください。

### 4. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、値を埋めてください。

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgres://postgres:postgres@localhost:xxxxx/template1?sslmode=disable"
JWT_SECRET="任意のランダムな文字列"
PORT=3000
MONGODB_URI="mongodb://ユーザー名:パスワード@host1:27017,host2:27017,host3:27017/todo-chat?ssl=true&replicaSet=xxxxx&authSource=admin&retryWrites=true&w=majority"
```

### 5. データベースのマイグレーション

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. サーバー起動

```bash
npm run dev
```

以下が表示されれば起動成功です。

```
Server is running on port 3000
[cron] スケジューラー起動完了(毎分実行)
[mongo] 接続成功
```

## テストの実行

```bash
npm test
```

Jestによる単体テスト(認証、Task CRUD)が実行されます。

## セキュリティチェック

```bash
npm run security-check
```

`npm audit` による脆弱性チェックを実行します。

## APIエンドポイント一覧

### 認証

| メソッド | パス | 内容 | 認証 |
|---|---|---|---|
| POST | /api/auth/register | ユーザー登録 | 不要 |
| POST | /api/auth/login | ログイン(JWT発行) | 不要 |

### タスク

| メソッド | パス | 内容 | 認証 |
|---|---|---|---|
| GET | /api/tasks | タスク一覧取得 | 必要 |
| GET | /api/tasks/:id | タスク詳細取得 | 必要 |
| POST | /api/tasks | タスク作成(title必須、dueDate任意) | 必要 |
| PUT | /api/tasks/:id | タスク更新 | 必要 |
| DELETE | /api/tasks/:id | タスク削除 | 必要 |
| GET | /api/tasks/jobs/logs | スケジュールジョブの実行ログ取得(直近20件) | 必要 |

認証が必要なエンドポイントは、リクエストヘッダーに以下を含めてください。

```
Authorization: Bearer <JWTトークン>
```

## Socket.io(リアルタイムチャット)

- 接続時、`auth: { token: JWTトークン }` を渡して認証
- イベント一覧
  - `chat:history` (サーバー→クライアント): 接続時に直近30件の履歴を送信
  - `chat:message` (双方向): メッセージの送受信
  - `chat:error` (サーバー→クライアント): エラー通知

## スケジュールタスク(定期ジョブ)

- `node-cron` により **毎分** 実行
- 内容: 期限(dueDate)が24時間以内に迫っている、未完了(pending)のタスクを検出
- 実行結果は PostgreSQL の `TaskJobLog` テーブルに記録(成功/失敗、検出件数、実行時刻)
- 失敗時は3回までリトライ、それでも失敗した場合は失敗ログを記録(ログ記録自体の失敗もハンドリング済み)
- `GET /api/tasks/jobs/logs` で実行履歴を取得可能(フロントエンドの画面からも確認できます)

## セキュリティ対策について

| 項目 | 対応内容 |
|---|---|
| SQLインジェクション | Prisma ORMによりクエリが自動的にパラメータ化されるため対策済み(生SQLは未使用) |
| XSS | JSON APIのためHTMLを直接返さない設計。フロントエンド(React)はJSX内で値を自動エスケープするため、スクリプト注入を防止。`helmet`によるセキュリティヘッダー設定は補完的な防御層として追加 |
| CSRF | JWTをlocalStorageに保存し、Authorizationヘッダーで明示的に送信する方式のため、ブラウザが自動送信するCookieを悪用するCSRF攻撃の経路が存在しない。トレードオフとして、XSSが発生した場合にトークンが窃取されるリスクがあるため、XSS対策(Reactの自動エスケープ、外部入力の`dangerouslySetInnerHTML`不使用)を徹底している |
| パスワード保護 | `bcrypt` でハッシュ化して保存 |
| 秘密情報管理 | `.env` で管理し `.gitignore` で除外、`.env.example` でキーのみ共有 |
| レート制限 | `express-rate-limit` により、全体で15分100リクエスト、認証系は15分10リクエストに制限 |
| 定期的なセキュリティテスト | `npm run security-check`(`npm audit`)で脆弱性チェックが可能 |

## 補足・既知の制限事項

- 開発環境ではローカルの `prisma dev`(組み込みPostgres)を使用しています。本番運用時は別途マネージドPostgres(RDS、Neon等)への切り替えを想定しています。
- MongoDBはMongoDB Atlas無料枠を使用しています。
- チャット機能は単一ルーム(`general`)のみ対応しています。
- 現在はシングルサーバー構成のため、複数サーバーへのスケールアウト時は `@socket.io/redis-adapter` 等を用いたクロスサーバーでのメッセージ配信の仕組みが別途必要になります。