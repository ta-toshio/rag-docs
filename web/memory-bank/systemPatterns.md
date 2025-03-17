# System Patterns

This file documents recurring patterns and standards used in the project.

## Coding Patterns

*   

## Architectural Patterns

*   

## Testing Patterns

## ファイル構成パターン

```plaintext
├── app  # Next.js のアプリケーションのルートディレクトリ
│   ├── api  # API エンドポイントを定義するフォルダ（App Router）
│   │   └── projects  # プロジェクトに関する API ルート
│   │       ├── [id]  # 個別のプロジェクトに関する API ルート
│   │       │   ├── files  # プロジェクト内のファイルに関する API ルート
│   │       │   │   ├── [fileId]  # 単一のファイルに関する API ルート
│   │       │   │   │   └── route.ts
│   │       │   │   └── route.ts  # 複数のファイルに関する API ルート
│   │       │   └── search  # プロジェクト内の検索 API ルート
│   │       │       └── route.ts
│   │       └── route.ts  # プロジェクトのリストに関する API ルート
│   ├── chat
│   │   └── page.tsx  # チャットページのコンポーネント
│   ├── globals.css  # グローバルなスタイル定義
│   ├── layout.tsx  # アプリ全体のレイアウトコンポーネント
│   ├── loading.tsx  # ローディング画面のコンポーネント
│   ├── page.tsx  # ルート (`/`) のページコンポーネント
│   └── projects
│       └── [id]
│           └── page.tsx  # プロジェクト詳細ページのコンポーネント
├── components  # 再利用可能な UI コンポーネント
│   ├── markdown-viewer.tsx  # Markdown を表示するコンポーネント
│   ├── page
│   │   └── project-page.tsx  # プロジェクトページのコンポーネント
│   ├── project-selector.tsx  # プロジェクト選択 UI
│   ├── search-bar.tsx  # 検索バーのコンポーネント
│   ├── search-dialog.tsx  # 検索ダイアログのコンポーネント
│   ├── theme-provider.tsx  # テーマ設定のプロバイダーコンポーネント
│   ├── tree-view.tsx  # ファイルやフォルダのツリー表示コンポーネント
│   └── ui-wrapper
│       └── tooltip.tsx  # ツールチップ UI コンポーネント
├── components.json  # コンポーネント情報を管理する JSON ファイル
├── domain  # ドメインロジック（アプリケーションのビジネスロジック）
│   ├── build-tree.ts  # ツリー構造の構築処理
│   ├── file-tree.ts  # ファイルツリーのデータモデル
│   ├── project.ts  # プロジェクトデータの管理ロジック
│   ├── translation.ts  # 翻訳データの管理ロジック
│   └── tree-node.ts  # ツリーノードのデータ構造
├── hooks  # React のカスタムフックを格納
│   ├── use-local-storage.tsx  # ローカルストレージ管理のカスタムフック
│   ├── use-mobile.tsx  # モバイル判定用のカスタムフック
│   └── use-toast.ts  # トースト通知用のカスタムフック
├── implementation_plan.md  # 実装計画に関するドキュメント
├── lib  # ユーティリティやサービス関数
│   ├── db.ts  # データベース関連の処理
│   └── utils.ts  # その他のユーティリティ関数

```


## 開発環境

|項目|技術スタック|
|---|---|
|**言語**|TypeScript|
|**CLI 実行環境**|Node.js|
|**データベース**|**Qdrant**|
|**埋め込みモデル**|Google Gemini API|
|**検索エンジン**|Qdrant|
|**ベクトル検索**|Qdrant（Docker）|


*