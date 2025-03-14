# システムパターン

## システム概要
- Webドキュメント翻訳・要約・検索システム
- CLIツールで構成
- Qdrantを使用してベクトル検索

## コンポーネント
- CLIツール (`translate-docs`)
    - Webコンテンツ処理
    - ローカルファイル処理
    - 翻訳・要約エンジン (Google Gemini API)
- Qdrant
    - ベクトルデータベース
    - 検索エンジン

## データフロー
- CLIツール
    - Webコンテンツ/ローカルファイル -> 翻訳・要約 -> Qdrant

## 技術選定
- TypeScript
- Node.js (CLI)
- Qdrant
- Google Gemini API

## CLIツールの詳細設計

### コマンド構造
```
translate-docs <command> [options]

Commands:
  url     Webコンテンツを処理する
  input   ローカルファイルを処理する

Options:
  --depth <number>      探索の深さ（Webの場合）
  --language <lang>     翻訳言語
  --summary-only        要約のみ実行
  --translate-only        翻訳のみ実行
  --allow-domains <domains>  許可ドメインの指定
  --force-fetch        キャッシュを無視して再取得
```

### オプション
*   `url`コマンド
    *   `--url <URL>`: 解析対象のURL（必須）
    *   `--depth <number>`: 探索の深さ（デフォルト: 3）
    *   `--language <lang>`: 翻訳言語（デフォルト: ja）
    *   `--summary-only`: 要約のみ実行
    *   `--translate-only`: 翻訳のみ実行
    *   `--allow-domains <domains>`: 許可ドメインの指定
    *   `--force-fetch`: キャッシュを無視して再取得
*   `input`コマンド
    *   `--input`: ローカルの`input/`フォルダ内のファイルを処理（必須）
    *   `--language <lang>`: 翻訳言語（デフォルト: ja）
    *   `--summary-only`: 要約のみ実行
    *   `--translate-only`: 翻訳のみ実行

### 処理パイプライン
1.  **Webコンテンツ処理 (`url`コマンド)**
    1.  指定されたURLからドキュメントをダウンロード
    2.  HTML/テキストをMarkdownに変換
    3.  Markdownを翻訳（必要に応じて）
    4.  Markdownを要約（必要に応じて）
    5.  翻訳済み/要約済みデータをQdrantに登録
    6.  Markdownファイルをローカルに保存
    7.  翻訳ファイルをローカルに保存（必要に応じて）
    8.  要約ファイルをローカルに保存（必要に応じて）
2.  **ローカルファイル処理 (`input`コマンド)**
    1.  `input/`フォルダ内のファイルを読み込む
    2.  ファイルをMarkdownに変換（必要に応じて）
    3.  Markdownを翻訳（必要に応じて）
    4.  Markdownを要約（必要に応じて）
    5.  翻訳済み/要約済みデータをQdrantに登録
    6.  Markdownファイルをローカルに保存
    7.  翻訳ファイルをローカルに保存（必要に応じて）
    8.  要約ファイルをローカルに保存（必要に応じて）

### エラーハンドリング
*   Webコンテンツのダウンロードエラー
    *   1回リトライ
    *   エラーログを出力
*   Markdownへの変換エラー
    *   エラーログを出力
*   翻訳/要約エラー
    *   エラーログを出力
*   ファイル保存エラー
    *   エラーログを出力
*   Google Gemini APIのレートリミット制御
    *   1分間に15リクエストまで
    *   Bottleneckでリクエスト間隔を調整
    *   リトライ（最大3回）
    *   バックオフ（指数関数的に待機時間を増やす）
*   Qdrantへの登録エラー
    *   エラーログを出力

## 改善提案

*   **モジュール化の強化:** CLIツールのコンポーネント（クローラー、パーサー、翻訳エンジン、要約エンジン、Qdrantクライアント）をより疎結合なモジュールに分割することを推奨します。
*   **エラーハンドリングの改善:** エラーハンドリング戦略をより詳細に定義し、リトライ、バックオフ、サーキットブレーカーなどのパターンを適用することを推奨します。
*   **設定管理の改善:** 環境変数だけでなく、設定ファイルをサポートし、より柔軟な設定管理を可能にすることを推奨します。
*   **レートリミット管理:** Google Gemini APIへのリクエスト回数制限を考慮し、レートリミットを管理することを推奨します。

### ディレクトリ構成

```
📂 translate-docs
├── input/              # ローカルの処理対象ファイル
│   ├── sample.txt
│   ├── docs/
│   │   ├── api-spec.txt
│   │   ├── guide.md
├── output/             # 変換結果を保存
│   ├── sample.com/     # Webコンテンツの出力
│   │   ├── markdown/
│   │   ├── translation/
│   │   ├── summary/
│   ├── input/          # ローカルファイルの出力
│   │   ├── markdown/
│   │   ├── translation/
│   │   ├── summary/
├── src/
│   ├── cli.ts           # CLI のエントリーポイント
│   ├── config.ts        # 設定・デフォルト値
│   ├── crawler/         # Webクローリング関連
│   │   ├── crawler.test.ts  # クローラーのテスト
│   │   ├── crawler.ts       # メインのクローラー
│   │   ├── htmlUtils.ts     # HTML処理ユーティリティ
│   │   ├── linkProcessor.ts # リンク処理
│   │   └── urlUtils.ts      # URL処理ユーティリティ
│   ├── databaseConnection.ts # データベース接続管理
│   ├── domain/          # ドメインモデル
│   │   ├── fileTreeEntry.test.ts # ファイルツリーエントリのテスト
│   │   ├── fileTreeEntry.ts      # ファイルツリーエントリのモデル
│   │   ├── language.ts           # 言語関連のモデル
│   │   ├── translationEntry.ts   # 翻訳エントリのモデル
│   │   ├── types.ts              # 型定義
│   │   └── vectorEntry.ts        # ベクトルエントリのモデル
│   ├── fileProcessor.ts # ローカルファイルの処理
│   ├── fileReader.ts    # ファイル読み込みユーティリティ
│   ├── fileWriter.test.ts # ファイル書き込みのテスト
│   ├── fileWriter.ts    # ファイル書き込みユーティリティ
│   ├── genAIClient.ts   # GenAI APIクライアント
│   ├── logger.ts        # ロギングユーティリティ
│   ├── parser/          # パーサー関連
│   │   ├── markdownFormatter.test.ts # Markdownフォーマッタのテスト
│   │   ├── markdownFormatter.ts      # Markdownフォーマッタ
│   │   ├── parser.ts                 # メインパーサー
│   │   └── turndown-plugin-gfm.d.ts  # Markdownプラグインの型定義
│   ├── path.ts          # パス処理ユーティリティ
│   ├── prompts.ts       # AIプロンプト管理
│   ├── qdrant/          # Qdrant関連
│   ├── repository/      # リポジトリ層
│   │   ├── fileTreeRepository.test.ts # ファイルツリーハンドラのテスト
│   │   ├── fileTreeRepository.ts      # ファイルツリーハンドラ
│   │   └── translationRepository.ts   # 翻訳ハンドラ
│   ├── resources/       # リソースファイル
│   │   └── tests/       # テスト用リソース
│   │       └── test.md  # テスト用Markdownファイル
│   ├── sorter.test.ts   # ソーターのテスト
│   ├── sorter.ts        # ソート処理
│   ├── summarizer.test.ts # 要約のテスト
│   ├── summarizer.ts    # 要約処理
│   ├── translator.test.ts # 翻訳のテスト
│   ├── translator.ts    # 翻訳処理
│   ├── types/           # 型定義
│   └── utils/           # ユーティリティ関数
│       ├── apiRetry.ts  # APIリトライ処理
│       ├── generateStructuredContent.ts # 構造化コンテンツ生成
│       └── rateLimiter.ts # APIレート制限
├── package.json         # 依存関係
├── tsconfig.json        # TypeScript 設定
├── .env                 # 環境変数
└── README.md            # 使い方のドキュメント
