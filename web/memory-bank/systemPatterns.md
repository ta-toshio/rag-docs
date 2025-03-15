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