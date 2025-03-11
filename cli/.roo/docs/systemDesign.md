# **システム設計書**

## **1. システム概要設計**

本システムは、**CLI (`translate-docs`) と Next.js (`web-ui`) を別リポジトリで管理** し、
Web 上の公式ドキュメントを **翻訳・要約・検索** 可能にする。
データは **Qdrant に保存され、検索時にはベクトル検索 + Google Gemini API を活用** する。

---

### **1.1 システムアーキテクチャ**

```
1. CLI (`translate-docs`) → Qdrant
2. Web UI (`web-ui`) → Qdrant
```

- **CLI (`translate-docs`)**
    - 指定 URL のドキュメントと、そのページに紐づくページを指定された階層まで探索
    - Google Gemini API で翻訳・要約
    - Markdown 形式で出力
    - Qdrant にデータ登録（ベクトル化）
    - **ローカル `input/` フォルダのファイルを Markdown 化**

---

## **2. データフロー**

```
1. CLI で指定されたURLのドキュメントと、そのページに紐づくページを指定された階層まで取得・翻訳・要約
2. Markdown ファイルをローカルに保存
3. 翻訳済みデータを Qdrant に登録（ベクトル化）
```

---

## **3. Qdrant のデータ構造**

|フィールド|型|説明|
|---|---|---|
|`vector`|`float[]`|埋め込みベクトル（Google Gemini API）|
|`text`|`string`|翻訳済みのテキスト|
|`original_text`|`string`|元の英語テキスト|
|`source`|`string`|Markdown ファイルのパス|
|`url`|`string`|元のページの URL|
|`language`|`string`|言語 (`ja`, `en` など)|
|`tags`|`string[]`|タグ情報|
|`timestamp`|`string`|取得日時|

#### **📌 データ登録**

- **翻訳完了後に、50件単位のバッチ処理で Qdrant に登録**
- **エラー時はリトライ（バックオフ戦略を実装）**

---

## **4. CLI 設計 (`translate-docs`)**

### **📌 CLI のディレクトリ構成**

```plaintext
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
│   ├── fileProcessor.ts # ローカルファイルの処理
│   ├── parser/        # HTML / テキスト → Markdown 変換
│   │   ├── parser.ts
│   │   ├── markdownFormatter.ts
│   ├── translator.ts    # Google Gemini API で翻訳
│   ├── summarizer.ts    # Google Gemini API で要約
│   ├── fileWriter.ts    # Markdown の書き出し
│   ├── utils/         # ユーティリティ関数
│   │   ├── rateLimiter.ts   # API レート制限
│   │   ├── apiRetry.ts
│   ├── config.ts        # 設定・デフォルト値
│   ├── types.ts         # 型定義
├── package.json         # 依存関係
├── tsconfig.json        # TypeScript 設定
├── .env                 # 環境変数
└── README.md            # 使い方のドキュメント
```

---

## **5. エラーハンドリング**

- **Google Gemini API のレートリミット制御**
    - **1分間に 15 リクエスト** まで
    - **Bottleneck でリクエスト間隔を調整**

- Webコンテンツのダウンロードエラー
    - 1回リトライ
    - エラーログを出力
