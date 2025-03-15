
# **フォルダ・ファイル構成と役割**

## **1. ディレクトリ構成**
本プロジェクトのディレクトリ構成を以下に示す。

```plaintext
├── app  # Next.js のアプリケーションのルートディレクトリ
│   ├── api  # API エンドポイントを定義するフォルダ（App Router）
│   │   ├── file
│   │   │   └── route.ts  # 単一のファイルに関する API ルート
│   │   ├── files
│   │   │   └── route.ts  # 複数のファイルに関する API ルート
│   │   └── resources
│   │       └── route.ts  # リソースに関する API ルート
│   ├── chat
│   │   └── page.tsx  # チャットページのコンポーネント
│   ├── globals.css  # グローバルなスタイル定義
│   ├── layout.tsx  # アプリ全体のレイアウトコンポーネント
│   ├── loading.tsx  # ローディング画面のコンポーネント
│   └── page.tsx  # ルート (`/`) のページコンポーネント
├── components  # 再利用可能な UI コンポーネント
│   ├── markdown-viewer.tsx  # Markdown を表示するコンポーネント
│   ├── project-selector.tsx  # プロジェクト選択 UI
│   ├── search-bar.tsx  # 検索バーのコンポーネント
│   ├── search-dialog.tsx  # 検索ダイアログのコンポーネント
│   ├── theme-provider.tsx  # テーマ設定のプロバイダーコンポーネント
│   ├── tree-view.tsx  # ファイルやフォルダのツリー表示コンポーネント
├── components.json  # コンポーネント情報を管理する JSON ファイル
├── hooks  # React のカスタムフックを格納
│   ├── use-mobile.tsx  # モバイル判定用のカスタムフック
│   └── use-toast.ts  # トースト通知用のカスタムフック
├── lib  # ユーティリティやサービス関数
│   ├── file-service.ts  # ファイル関連のサービス関数
│   └── utils.ts  # その他のユーティリティ関数
```