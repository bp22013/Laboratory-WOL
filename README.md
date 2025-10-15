# Laboratory-WOL

これは、Wake-on-LAN (WoL) のマジックパケットを送信し、リモートでデバイスを起動させるための Web アプリケーションです。ユーザー認証機能を備え、ダッシュボードから簡単に対象デバイスの管理・操作ができます。

## ✨ 主な機能

-   **ユーザー認証**: Clerk を利用した安全なサインアップ、サインイン機能。
-   **デバイス管理**: 起動したいデバイスの登録、編集、削除 (CRUD)。
-   **Wake-on-LAN**: 登録したデバイスに対してマジックパケットを送信し、リモートで起動。
-   **ダッシュボード**: 登録済みデバイスの一覧表示と管理。
-   **レスポンシブデザイン**: PC、スマートフォン、タブレットなど各種デバイスに対応。
-   **テーマ切り替え**: ライトモードとダークモードの切り替え機能。

## 🛠️ 使用技術

-   **フレームワーク**: [Next.js](https://nextjs.org/) (App Router)
-   **言語**: [TypeScript](https://www.typescriptlang.org/)
-   **バックエンド API**: [Hono](https://hono.dev/)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **データベース**: [Neon](https://neon.tech/) (PostgreSQL)
-   **認証**: [Clerk](https://clerk.com/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
-   **フォーム管理**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
-   **データ取得**: [SWR](https://swr.vercel.app/)

## 🚀 セットアップ手順

1.  **リポジトリをクローン**:

    ```bash
    git clone https://github.com/your-username/Laboratory-WOL.git
    cd Laboratory-WOL
    ```

2.  **依存関係をインストール**:
    プロジェクトルートには `bun.lock` ファイルが存在するため、`bun` の利用を推奨します。

    ```bash
    bun install
    ```

3.  **環境変数を設定**:
    `.env.local.example` ファイルを参考に `.env` ファイルを作成し、Clerk やデータベースの接続情報などを設定してください。

    `.env.local.example`

    ```
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

    # Database (Neon)
    DATABASE_URL=
    ```

4.  **データベースのマイグレーション**:
    Drizzle Kit を使用して、スキーマをデータベースに反映させます。

    ```bash
    bun drizzle-kit push:pg
    ```

5.  **開発サーバーを起動**:
    ```bash
    bun run next dev
    ```
    [http://localhost:3000](http://localhost:3000) にアクセスしてアプリケーションを表示します。

## 📜 利用可能なスクリプト

-   `bun run next dev`: 開発モードでアプリケーションを起動します。
-   `bun run next build`: プロダクション用にアプリケーションをビルドします。
-   `bun run next start`: ビルドされたプロダクションサーバーを起動します。
-   `bun run next lint`: ESLint を使用してコードの静的解析を実行します。

## 📁 ディレクトリ構成

```
.
├── src
│   ├── app/              # Next.js App Router のメインディレクトリ
│   │   ├── (auth)/       # 認証関連ページ (ログイン、サインアップなど)
│   │   ├── dashboard/    # メインのダッシュボードページ
│   │   ├── api/          # Hono を使った API ルート
│   │   └── layout.tsx    # アプリケーションの共通レイアウト
│   ├── components/       # UIコンポーネント (shadcn/ui を含む)
│   ├── lib/              # ヘルパー関数、クライアント、Context など
│   └── server/           # サーバーサイドのロジック
│       ├── db/           # Drizzle ORM のスキーマ、マイグレーション
│       └── route/        # Hono のルーティング定義
└── ...
```
