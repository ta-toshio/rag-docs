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

### **📌 3.1 `file_tree_collection`（ファイルツリー情報）**

**目的**:

- Webサイトやローカルファイルのフォルダ・ファイル構造を管理する
- **フォルダ階層をツリー構造として保持し、子要素を `children` として格納**

**検索用途**:

- **特定のドメインごとのフォルダ・ファイルリストを取得**
- **Next.js の UI でファイルツリーを表示**

```typescript
export interface FileTreeEntry {
  id: string;          // ✅ ユニークな識別子 (reference をそのまま使う)
  domain: string;      // ドメイン (例: "sample.com")
  name: string;        // フォルダ・ファイル名
  type: "file" | "folder"; // ファイル or フォルダ
  path: string;        // 完全パス (/docs/setup など)
  parent: string | null; // 親フォルダのパス (ルートなら null)
  children: string[];  // ✅ 子要素の `path` をリスト化
  timestamp: string;   // 登録日時
}
```

#### **データ例**

```json
[
  {
    "id": "1",
    "domain": "sample.com",
    "name": "setup",
    "type": "file",
    "path": "/docs/setup",
    "parent": "/docs",
    "children": [],
    "timestamp": "2025-03-12T12:00:00Z"
  },
  {
    "id": "2",
    "domain": "sample.com",
    "name": "docs",
    "type": "folder",
    "path": "/docs",
    "parent": null,
    "children": ["/docs/setup", "/docs/install"],
    "timestamp": "2025-03-12T12:00:00Z"
  }
]
```

---

### **📌 3.2 `translation_collection`（翻訳データ）**

**目的**:

- 翻訳・要約データを保存し、Qdrant の **ベクトル検索** で関連データを取得する
- **ファイルツリー (`file_tree_collection`) と `id` で紐づけることで、検索の一貫性を保つ**

**検索用途**:

- **`id` を指定して翻訳データを取得**
- **ベクトル検索 (`vector`) により類似したドキュメントを検索可能にする**

```typescript
export interface TranslationEntry {
  id: string;          // ✅ ユニークな識別子 (reference をそのまま使う)
  title: string;       // ✅ ドキュメントのタイトル
  summary: string;     // ✅ 翻訳された要約テキスト
  description: string; // ✅ 詳細な説明（メタデータ）
  vector: number[];    // 埋め込みベクトル (Google Gemini API)
  text: string;        // 翻訳済みテキスト
  original_text: string; // 元の英語テキスト
  language: string;    // 言語 (例: "ja", "en")
  keywords: string[];  // ✅ キーワードリスト
  timestamp: string;   // 取得日時
}
```

#### **データ例**

```json
[
  {
    "id": "3",
    "title": "Setup Guide",
    "summary": "セットアップ手順の概要",
    "description": "このガイドはアプリのセットアップ方法を説明します。",
    "vector": [0.12, 0.34, 0.56],
    "text": "翻訳済みのセットアップ手順",
    "original_text": "Original setup instructions",
    "language": "ja",
    "keywords": ["setup", "installation"],
    "timestamp": "2025-03-12T12:00:00Z"
  }
]
```

---

### **3.3. データのマッピング**  

- **`file_tree_collection.id`** と **`translation_collection.id`** を統一し、マッピングキーとする  
- **ファイルツリー取得後に `id` をキーに翻訳データを取得**  
- **各ファイルと翻訳データが1対1で対応するようにする**  

#### **マッピングの流れ**  
1. **ファイルツリー (`file_tree_collection`) から `id` を取得**  
2. **同じ `id` を持つ翻訳データ (`translation_collection`) を取得**  
3. **Next.js でツリーを表示し、選択したファイルの翻訳データを取得**  


### **3.4. 非機能要件**

### **📌 3.4.1 パフォーマンス**
- **ファイルツリー情報は通常のフィルタ検索 (`domain` / `path` で検索) を使用**。
- **翻訳データの取得は `id` 指定で高速に取得可能**。
- **類似検索はベクトル検索を使用し、高速な類似ドキュメント取得を実現**。
- **Qdrant のバッチ処理を活用し、データ登録を 50 件単位で最適化**。

---

### **📌 3.4.2 エラーハンドリング**
- **データ登録失敗時にリトライ（最大3回）**。
- **ネットワークエラー時にバックオフ（指数関数的リトライ）を実装**。
- **翻訳・要約のエラー時はログを出力し、処理をスキップせず次のデータに進む**。

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


## **5. 非機能要件**
### **📌 パフォーマンス**
- **Qdrant を使用した高速なベクトル検索**

### **📌 セキュリティ**
- **API キーの環境変数管理**
- **外部API（Gemini）のレートリミット対策**

### **📌 運用・保守**
- **ログ出力（CLIのエラーハンドリング）**
- **エラーハンドリング（リトライ・バックオフの実装）**
- **環境変数で設定を管理（API キー）**

---

## **6. 制約条件**
- Webコンテンツのダウンロードエラー
    - 1回リトライ
    - エラーログを出力
- **Google Gemini API の利用制限
    - **1分間に 15 リクエスト** まで
    - **Bottleneck でリクエスト間隔を調整**
- **Qdrant を Docker でローカル環境に構築**
