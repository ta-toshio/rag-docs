# **検索機能 仕様書**

## **1. 概要**
本仕様書では、Next.js の **Server Actions** を利用し、Qdrant クライアントを経由して検索機能を実装する方法を定義する。検索対象は **Qdrant に保存された翻訳データのベクトル検索** を行い、類似したドキュメントを返す。

---

## **2. 検索機能の要件**

### **2.1 基本機能**
- **キーワード検索**: クエリを Qdrant に送信し、類似した翻訳済みテキストを検索
- **検索結果のスコア順ソート**: 類似度の高い順に表示
- **最大取得件数の制限** (`top_k`)

### **2.2 仕様詳細**

| 機能                 | 説明 |
|----------------------|------|
| **ベクトル検索**       | 入力テキストを埋め込みベクトルに変換し、Qdrant に類似検索をリクエスト |
| **検索結果の件数制限** | 最大 `top_k=5` 件を取得 |
| **スコア順ソート**    | 類似度の高い順にソート |

---

## **3. 実装方針**

### **3.1 データの流れ**

1. **検索リクエスト受信**: ユーザーが検索クエリを入力し、Next.js の Server Action を呼び出す。
2. **埋め込みベクトル変換**: Google Gemini API を利用して入力テキストをベクトル化。
3. **Qdrant へ検索リクエスト送信**: ベクトルデータを用いて Qdrant へ類似検索を実施。
4. **検索結果の取得・整形**: Qdrant から取得したデータを整形し、フロントエンドへ返す。

---

## **4. Server Action の実装**

### **4.1 Server Action の定義**

以下のコードはイメージです。

```typescript
"use server";

import { qdrantClient } from "@/lib/qdrant";
import { getEmbedding } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

export async function searchDocuments(formData: FormData) {
  const query = formData.get("query") as string;
  const language = formData.get("language") as string;
  const top_k = Number(formData.get("top_k")) || 5;

  if (!query) {
    throw new Error("検索クエリが必要です。");
  }

  // 1. クエリを埋め込みベクトルに変換
  const vector = await getEmbedding(query);

  // 2. Qdrant に検索リクエスト送信
  const searchResults = await qdrantClient.search("vectors", {
    vector: vector,
    top_k: top_k,
    filter: {
      must: [{ key: "project_id", match: { value: project_id } }]
    }
  });

  // 3. 取得した結果からresource_idを抽出

  // 4. 3で抽出したresource_idとproject_idを検索条件にfile_treesテーブルからマッチしたレコードを取得

  // 5. 3 or 4で取得したresource_idを条件にtranslationsテーブルからマッチしたレコードを取得。4のデータとマッピングしたデータを作成する

  // 6. キャッシュをリフレッシュ
  revalidatePath("/search");

  // 7. 5を返却
}
```

---

## **5. フロントエンド連携**

- **`search-bar.tsx` が検索フォーム。ここからserver actionsのsearchDocumentsを実行する**
- **検索結果を `search-dialog.tsx` で表示する**

---

## **6. まとめ**

✅ **Next.js Server Actions を利用し、Qdrant で検索**  
✅ **Google Gemini API で埋め込みベクトル変換を実施**  
✅ **検索結果はスコア順でソート & 言語フィルタ適用**  
✅ **検索結果を `search-dialog.tsx` で UI 表示**  
