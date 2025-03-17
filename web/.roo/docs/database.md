
### **📌 Qdrant + SQLite 要件定義書（修正済み）**

## **1. システム構成**

本システムでは、**SQLite と Qdrant を組み合わせてデータ管理・検索を行う**。  
それぞれの役割は以下の通り：

1. **プロジェクト情報 (`projects`, SQLite)**
   - **対象となる Web サイトやローカルプロジェクトを識別するための情報を管理**
   - **`file_trees` や `translations` のデータをプロジェクト単位で整理**
   - **ドメインや指定した値を `value` に設定し、一意に識別**
2. **ファイルツリー情報 (`file_trees`, SQLite)**
   - **Webサイトやローカルファイルのフォルダ・ファイル構造を管理**
   - **Next.js の UI でツリー表示** に利用
3. **翻訳データ (`translations`, SQLite)**
   - **Google Gemini API で翻訳・要約したデータを管理**
   - **ファイル単位で翻訳情報を保存**
4. **ベクトルデータ (`vectors`, Qdrant)**
   - **翻訳済みテキストを段落ごとに分割し、ベクトル検索を可能にする**
   - **類似コンテンツ検索を Qdrant で実施**


---

## **2. データ構造**

### **📌 2.1 `projects`（SQLite: プロジェクト情報）**

**目的**:

- 各プロジェクト（対象となるドメインや識別可能な値）を管理する
- **`file_trees` や `translations` のデータをプロジェクト単位で整理する**
- **ドメインまたは指定した値を `value` に設定し、一意に識別する**

**検索用途**:

- **登録されたプロジェクトの一覧を取得**
- **ファイルツリーや翻訳データの検索時にプロジェクト単位でフィルタリング**

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,  -- ✅ ユニークな識別子
  value TEXT NOT NULL UNIQUE, -- ✅ ドメインまたは指定した値、一意に識別
  timestamp TEXT NOT NULL -- 登録日時 (ISO8601)
);
```

#### **📌 ProjectEntry (TypeScript 型定義)**

```typescript
export interface ProjectEntry {
  id: string;
  value: string;
  timestamp: string;
}
```
##### **データ例**
```json
[
  {
    "id": "proj-001",
    "value": "sample.com",
    "timestamp": "2025-03-12T12:00:00Z"
  }
]
```

### **📌 2.2 `file_trees`（SQLite: ファイルツリー情報）**

**目的**:

- Webサイトやローカルファイルのフォルダ・ファイル構造を管理する
- **SQLite で管理し、高速なフィルタ検索を実現**

**検索用途**:

- **特定のドメインごとのフォルダ・ファイルリストを取得**
- **Next.js の UI でファイルツリーを表示**

```sql
CREATE TABLE file_trees (
  id TEXT PRIMARY KEY,  -- ✅ ユニークな識別子 
  project_id TEXT NOT NULL, -- ✅ projects の外部キー
  resource_id TEXT NOT NULL, -- ✅ ユニークな識別子 リソースの場所
  domain TEXT NOT NULL, -- ドメイン名 ("sample.com" など)
  name TEXT NOT NULL,   -- フォルダ・ファイル名
  type TEXT CHECK(type IN ('file', 'folder')) NOT NULL, -- ファイル or フォルダ
  path TEXT NOT NULL,   -- 完全パス (/docs/setup など)
  parent TEXT,          -- 親フォルダのパス (ルートなら NULL)
  timestamp TEXT NOT NULL, -- 登録日時 (ISO8601)
  sort_order INTEGER NOT NULL DEFAULT 0 -- ソート順
);
```

---

#### **📌 FileTreeEntry (TypeScript 型定義)**

Based on the `file_trees` schema:

```typescript
export interface FileTreeEntry {
  id: string;
  project_id: string;
  resource_id: string;
  domain: string;
  name: string;
  type: "file" | "folder";
  path: string;
  parent: string | null;
  timestamp: string;
  sort_order: number;
}
```
##### **データ例**

```json
[
  {
    "id": "UUID7の文字列",
    "project_id": "projects.id",
    "resource_id": "https://sample.com/docs/setup",
    "domain": "sample.com",
    "name": "setup",
    "type": "file",
    "path": "/docs/setup",
    "parent": "/docs",
    "timestamp": "2025-03-12T12:00:00Z",
    "sort_order": 0
  }
]
```

---

### **📌 2.3 `translations`（SQLite: 翻訳データ）**

**目的**:

- 翻訳・要約データを SQLite に保存する
- **ファイルツリー (`file_trees`) と `id` で紐づけることで、検索の一貫性を保つ**
- **高速なファイル単位の検索・取得を実現**

**検索用途**:

- **`id` を指定して翻訳データを取得**
- **検索時に `keywords` を活用して関連データを検索**

```sql
CREATE TABLE translations (
  id TEXT PRIMARY KEY,  -- ✅ ユニークな識別子 
  resource_id TEXT NOT NULL, -- ✅ ユニークな識別子 リソースの場所
  title TEXT NOT NULL,  -- ✅ ドキュメントのタイトル
  summary TEXT NOT NULL,-- ✅ 翻訳された要約テキスト
  description TEXT,     -- ✅ 詳細な説明（メタデータ）
  text TEXT NOT NULL,   -- 翻訳済みテキスト
  original_text TEXT NOT NULL, -- 元の英語テキスト
  language TEXT NOT NULL,      -- 言語 (例: "ja", "en")
  keywords TEXT,       -- ✅ キーワードリスト (JSON 形式の文字列)
  timestamp TEXT NOT NULL -- 取得日時 (ISO8601)
);
```

---

#### **📌 TranslationEntry (TypeScript 型定義)**

Based on the `translations` schema:

```typescript
export interface TranslationEntry {
  id: string;
  resource_id: string;
  title: string;
  summary: string;
  description: string | null;
  text: string;
  original_text: string;
  language: string;
  keywords: string | null;
  timestamp: string;
}
```

##### **データ例**

```json
[
  {
    "id": "UUID7の文字列",
    "resource_id": "https://sample.com/docs/setup",
    "title": "Setup Guide",
    "summary": "セットアップ手順の概要",
    "description": "このガイドはアプリのセットアップ方法を説明します。",
    "text": "翻訳済みのセットアップ手順",
    "original_text": "Original setup instructions",
    "language": "ja",
    "keywords": "[\"setup\", \"installation\"]",
    "timestamp": "2025-03-12T12:00:00Z"
  }
]
```

---

### **📌 2.4 `vectors`（Qdrant: ベクトルデータ）**

**目的**:

- 段落毎にデータを保存し、Qdrant の **ベクトル検索** で関連データを取得する
- **Markdown の改行 (`\n\n`) で区切り、1 段落 200〜500 文字に分割**
- **SQLite の `translations` と `resource_id` で関連付ける**

**検索用途**:

- **ベクトル検索 (`vector`) により類似したドキュメントを検索可能にする**

```typescript
export interface VectorEntry {
  id: string;          // ✅ ユニークな識別子 (ドキュメントの識別子 + 段落番号)
  project_id: string;  // ✅ projects の id に対応
  resource_id: string;     // ✅ translations の resource_id に対応
  paragraph_index: number;
  vector: number[];    // ✅ 埋め込みベクトル (Google Gemini API, 768次元)
  original_text: string; // ✅ 元のテキスト
  language: string;    // ✅ 言語 (例: "ja", "en")
  timestamp: string;   // 取得日時
}
```

---

## **3. データ登録・検索の流れ**

### **📌 3.1 データ登録**

4. **`file_trees` にファイルツリー情報を SQLite に登録**
5. **`translations` に翻訳データを SQLite に登録**
6. **`vectors` に段落ごとのベクトルデータを Qdrant に登録**

### **📌 3.2 データ検索**

#### **1️⃣ ファイルツリーを取得 (SQLite)**

```sql
SELECT * FROM file_trees WHERE domain = "sample.com";
```

#### **2️⃣ 翻訳データを取得 (SQLite)**

```sql
SELECT * FROM translations WHERE resource_id = "https://sample.com/docs/setup";
```

#### **3️⃣ ベクトル検索 (Qdrant)**

```typescript
const vectorQuery = {
  vector: [0.12, 0.34, 0.56], // クエリテキストの埋め込みベクトル
  top_k: 5, // 取得する上位件数
  filter: {
    must: [
      { key: "language", match: { value: "ja" } }
    ]
  }
};
const similarDocs = await qdrantClient.search("vectors", vectorQuery);
```

---

## **3. データのマッピング**  

- **`file_trees.resource_id`** と **`translations.resource_id`** を統一し、マッピングキーとする  
- **ファイルツリー取得後に `resource_id` をキーに翻訳データを取得**  
- **各ファイルと翻訳データが1対1で対応するようにする**  

#### **マッピングの流れ**  
1. **ファイルツリー (`file_trees`) から `resource_id` を取得**  
2. **同じ `resource_id` を持つ翻訳データ (`translations`) を取得**  
3. **Next.js でツリーを表示し、選択したファイルの翻訳データを取得**  


## **4. Qdrant の運用方針**

### **📌 4.1 データ登録のルール**
- **`translations` は `file_trees.id` を `id` に統一し、マッピング**。


### **📌 4.2 データ取得・更新**
- **ファイルツリーは `domain` 指定で取得し、ツリー表示に利用**。
- **翻訳データは `resource_id` 指定で取得し、ファイルごとの翻訳内容を取得**。
- **類似検索はベクトル検索 (`vector` を利用) によって行う**。

## **5. 非機能要件**

### **📌 5.1 パフォーマンス**
- **ファイルツリー情報は通常のフィルタ検索 (`domain` / `path` で検索) を使用**。
- **類似検索はベクトル検索を使用し、高速な類似ドキュメント取得を実現**。
- **Qdrant のバッチ処理を活用し、データ登録を 50 件単位で最適化**。

---

### **📌 5.2 エラーハンドリング**
- **データ登録失敗時にリトライ（最大3回）**。
- **ネットワークエラー時にバックオフ（指数関数的リトライ）を実装**。
- **翻訳・要約のエラー時はログを出力し、処理をスキップせず次のデータに進む**。

---


## **6. まとめ**

✅ **プロジェクト情報 (`projects`) を追加し、データをプロジェクト単位で整理**  
✅ **ファイルツリー (`file_trees`) と 翻訳データ (`translations`) は SQLite で管理**  
✅ **検索高速化のため、`translations` の `keywords` に JSON 形式のインデックスを活用**  
✅ **ベクトル検索 (`vectors`) は Qdrant を使用し、類似検索を最適化**  
✅ **検索時の流れは `SQLite → Qdrant` の順で処理し、効率化**  