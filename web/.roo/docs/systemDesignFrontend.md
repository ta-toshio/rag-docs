# **RAG チャットシステム 要件定義書（2025年版）**

## **1. 基本情報**

- **プロジェクト名称**: RAG チャットシステム
- **リポジトリ名**: `doc-translator`
- **開発言語**: TypeScript
- **フレームワーク**:
    - **Webアプリ**: Next.js (Server Actions)
    - **データ管理**: Qdrant, SQLite, Redis (キャッシュ)
- **主要ライブラリ**:
    - `@google/generative-ai` (Google Gemini API)
    - `@qdrant/js-client-rest` (Qdrant)
    - `better-sqlite3` (データベース管理)
    - `langchain` (RAG チェーン管理)

---

## **2. プロジェクト概要**
本プロジェクトは、**Web 上の公式ドキュメントを検索・要約し、自然なチャット形式でユーザーに回答する RAG (Retrieval-Augmented Generation) チャットシステム** を提供する。

### **主な機能**
✅ **チャット形式の対話型 Q&A**  
✅ **Qdrant によるベクトル検索**  
✅ **Google Gemini API を活用した自然言語応答**  
✅ **同一セッション内での履歴管理**  
✅ **過去のセッションを再開する機能（履歴の永続化）**  

---

## **3. 機能要件**

### **3.1 チャット機能**
✅ **ユーザーの入力を Google Gemini API に渡し、RAG を用いた回答を生成**  
✅ **検索時に Qdrant で類似情報を取得し、Gemini のコンテキストとして渡す**  
✅ **スコアの高い検索結果を優先的に使用**（しきい値: `0.85`）  
✅ **会話履歴をセッション内 (`BufferMemory`) で保持**  
✅ **SQLiteに会話履歴を保存し、過去のセッションを再開可能にする**  

---

### **3.2 Qdrant ベクトル検索**
✅ **ユーザーの入力を Google AI Embeddings (`embedding-004`) でベクトル化**  
✅ **Qdrant に保存されたベクトルデータと比較し、類似検索を実行**  
✅ **検索結果をスコアに基づいて分類**  
    - `0.85` 以上: **「重要情報」**  
    - `0.85` 未満: **「参考情報」**  
✅ **検索結果を Gemini API に渡す前に要約し、トークン数を最適化**  
✅ **スコアが `0.7` 未満の検索結果は除外**  

---

### **3.3 会話履歴の保存 & 再開**
✅ **SQLite に長期的な会話履歴を保存し、過去のセッションを管理**  
✅ **会話の発言者（`user` or `assistant`）を記録**  
✅ **過去のセッションを復元し、`BufferMemory` にセット**  
✅ **新しい会話の履歴はリアルタイムで更新し、DB に保存**  
✅ **過去の会話一覧を提供し、検索・再開を可能にする**  

#### **データベース（SQLite）テーブル設計**
| カラム名 | 型 | 説明 |
|---|---|---|
| `id` | `INTEGER PRIMARY KEY` | セッションID |
| `session_id` | `TEXT` | セッション識別子（UUID） |
| `message` | `TEXT` | 会話履歴 |
| `role` | `TEXT` | uesr or assistant |
| `created_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | セッション開始時間 |
| `updated_at` | `DATETIME DEFAULT CURRENT_TIMESTAMP` | 最終更新時間 |


---

## **4. API & Server Actions 設計**

### **4.1 Server Actions 一覧**
| 関数名 | 役割 |
|---|---|
| `processChat(userInput, sessionId, userId)` | チャットリクエストの処理（過去の履歴を考慮） |
| `searchQdrant(query)` | Qdrant でベクトル検索を実行 |
| `generateEmbeddings(text)` | Google AI Embeddings でテキストをベクトル化 |
| `getChatHistory(sessionId)` | 過去のチャット履歴を取得（Redis 優先） |
| `saveChatHistory(sessionId, userId, messages)` | 会話履歴を保存（Redis & SQLite） |

✅ **クライアントは `processChat()` を呼び出すことで、自動的に履歴を考慮した対話が可能に！**

---

## **5. 非機能要件**

### **5.1 パフォーマンス**
✅ **API レートリミットを考慮**（Gemini API の制約: **1分間 15リクエスト**）  
✅ **検索時の処理最適化（上位 `5` 件のみ取得）**  
✅ **検索結果の要約機能を導入し、トークン数を節約**  
✅ **Redis にキャッシュを保存し、履歴のロードを高速化**  

### **5.2 セキュリティ**
✅ **API キーは環境変数で管理**  
✅ **SQLite データは暗号化対応も検討**  
✅ **Qdrant のアクセス制御（認証が必要な場合）**  

### **5.3 運用・保守**
✅ **ログ出力（エラーハンドリング対応）**  
✅ **SQLite & Redis のデータバックアップ対応**  
✅ **環境変数で設定を管理（翻訳対象言語, API キー, 許可ドメインなど）**  
✅ **過去のセッション一覧をユーザーに提供し、検索機能を追加**  

---

## **6. 開発環境**

| 項目 | 技術スタック |
|---|---|
| **言語** | TypeScript |
| **フレームワーク** | Next.js (Server Actions) |
| **データベース** | SQLite, Qdrant |
| **埋め込みモデル** | Google AI Embeddings (`embedding-004`) |
| **検索エンジン** | Qdrant |


