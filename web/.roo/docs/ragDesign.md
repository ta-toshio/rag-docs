# **RAG チャットシステム 設計書**

## **1. システム概要**
本システムは、**ユーザーの入力をもとに Qdrant に保存された情報を検索し、Google Gemini API で回答を生成する RAG（Retrieval-Augmented Generation） チャットシステム** である。

✅ **Qdrant によるベクトル検索を実装**  
✅ **Google AI Embeddings (`embedding-004`) を利用した検索最適化**  
✅ **チャット履歴を `SQLite` に保存し、過去のセッションを再開可能にする**  
✅ **Next.js の `Server Actions` を活用し、サーバーサイド処理を最適化**  
✅ **検索結果をスコア順に分類し、重要度の高い情報を優先的に利用**  
✅ **会話履歴を `BufferMemory` にセットし、過去のやり取りを考慮した回答を生成**  
✅ **履歴は `SQLite` に保存し、セッション再開時に `BufferMemory` に復元**  

---

## **2. クラス・ファイル構造**

### **📂 ディレクトリ構成**
```plaintext
├── app  # Next.js のアプリケーションルート
│   ├── chat
│   │   ├── page.tsx  # チャット画面の UI
│   │   ├── chat-box.tsx  # ユーザー入力欄と送信ボタン
│   │   ├── chat-message.tsx  # 送受信メッセージの表示
│   │   ├── chat-container.tsx  # チャット全体の管理
├── components  # 再利用可能な UI コンポーネント
│   ├── markdown-viewer.tsx  # Markdown を表示
│   ├── loading-spinner.tsx  # ローディングスピナー
├── actions  # Next.js の Server Actions
│   ├── chat.ts  # チャットリクエストの処理
│   ├── embeddings.ts  # Google AI Embeddings を用いたベクトル化処理
│   ├── search.ts  # Qdrant での検索処理
│   ├── rag.ts  # RAG の統合処理
│   ├── chat-history.ts  # SQLite に会話履歴を保存・取得
├── lib  # ライブラリやユーティリティ
│   ├── db.ts  # SQLite の管理
│   ├── qdrant.ts  # Qdrant のクライアント設定
│   ├── gemini.ts  # Google Gemini API のラッパー
│   ├── google-embeddings.ts  # Google AI Embeddings のカスタムクラス
```

---

## **3. クラス & 実装内容 **

### **📌 `google-embeddings.ts`（Google AI Embeddings のカスタムクラス）**
```typescript
import { Embeddings } from "langchain/embeddings/base";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GoogleEmbeddings extends Embeddings {
  model: any;

  constructor() {
    super();
    this.model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
      model: "embedding-004",
    });
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await this.model.embedContent({ content: text });
    return response.embedding.values;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedQuery(text)));
  }
}
```

---

### **📌 `chat-history.ts`（SQLite の履歴保存 & 取得）**
```typescript
import { getDB } from "@/lib/db";

export async function getChatHistory(sessionId: string) {
  const db = await getDB();
  const result = await db.get("SELECT messages FROM chat_sessions WHERE session_id = ?", sessionId);
  return result ? JSON.parse(result.messages) : [];
}

export async function saveChatHistory(sessionId: string, userId: string, messages: { role: string; content: string }[]) {
  const db = await getDB();
  await db.run(
    `INSERT INTO chat_sessions (user_id, session_id, messages)
     VALUES (?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET messages = excluded.messages, updated_at = CURRENT_TIMESTAMP`,
    [userId, sessionId, JSON.stringify(messages)]
  );
}
```

---

### **📌 `chat.ts`（チャットのエントリーポイント）**
```typescript
import { createRAGChain } from "@/actions/rag";

export async function processChat(userInput: string, sessionId: string, userId: string) {
  return await createRAGChain(userInput, sessionId, userId);
}
```


### **📌 `rag.ts`（RAG チェーンの統合処理）**
```typescript
import { ConversationalRetrievalChain } from "langchain/chains";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { searchQdrant } from "@/actions/search";
import { getChatHistory, saveChatHistory } from "@/actions/chatHistory";
import { getGoogleGenerativeModel } from "@/lib/gemini";
import { AIMessage, HumanMessage } from "langchain/schema";

const sessionMemory: Record<string, BufferMemory> = {};

/**
 * RAG チャット処理（履歴を考慮し、Qdrant 検索結果を統合）
 */
export async function createRAGChain(userInput: string, sessionId: string, userId: string) {
  let pastMessages = await getChatHistory(sessionId);

  if (!sessionMemory[sessionId]) {
    sessionMemory[sessionId] = new BufferMemory({ memoryKey: "chat_history", returnMessages: true });
    for (const msg of pastMessages) {
      sessionMemory[sessionId].chatHistory.addMessage(
        msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      );
    }
  }
  const memory = sessionMemory[sessionId];
  const { highScoreDocs, normalScoreDocs } = await searchQdrant(userInput);
  const prioritizedContext = [
    ...highScoreDocs.map((res) => `🔹 重要情報: ${res.payload.text}`),
    ...normalScoreDocs.map((res) => `🔸 参考情報: ${res.payload.text}`),
  ].join("\n");

  const chain = ConversationalRetrievalChain.fromLLM(
    new ChatGoogleGenerativeAI(getGoogleGenerativeModel()), { memory }
  );

  const response = await chain.call({ question: userInput, chat_history: memory, context: prioritizedContext });

  pastMessages.push({ role: "user", content: userInput }, { role: "assistant", content: response.text });
  await saveChatHistory(sessionId, userId, pastMessages);
  return response.text;
}
```

---

### **📌 `search.ts`（Qdrant ベクトル検索の実装）**
```typescript
import { qdrantClient } from "@/lib/qdrant";
import { GoogleEmbeddings } from "@/lib/GoogleEmbeddings";

const SCORE_THRESHOLD = 0.85;
const COLLECTION_NAME = "vector_collection";

export async function searchQdrant(query: string, topK: number = 5) {
  const embeddings = new GoogleEmbeddings();
  const queryVector = await embeddings.embedQuery(query);
  try {
    const results = await qdrantClient.search(COLLECTION_NAME, { vector: queryVector, limit: topK });
    const highScoreDocs = results.filter((res) => res.score >= SCORE_THRESHOLD);
    const normalScoreDocs = results.filter((res) => res.score < SCORE_THRESHOLD);
    return { highScoreDocs, normalScoreDocs };
  } catch (error) {
    console.error("Error in searchQdrant:", error);
    return { highScoreDocs: [], normalScoreDocs: [] };
  }
}
```

---

### **📌 `qdrant.ts`（Qdrant クライアント設定）**
```typescript
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
});
```

