"use server";

import { searchVectors } from "@/lib/qdrant";
import { getEmbedding } from "@/lib/gemini";
import { revalidatePath } from "next/cache";
import db from "@/lib/db";
import { TranslationEntry } from "@/domain/translation";
import { FileTreeEntry } from "@/domain/file-tree";

// TreeNodeを拡張した検索結果の型定義
export interface SearchResult {
  id: string;
  name: string;
  path: string;
  hitText: string;  // vector_collectionのoriginal_textの値
  score: number;    // 検索結果のスコア
}

export async function searchDocuments(formData: FormData): Promise<SearchResult[]> {
  const query = formData.get("query") as string;
  const projectId = formData.get("projectId") as string;
  const topK = Number(formData.get("topK")) || 5;

  if (!query) {
    throw new Error("検索クエリが必要です。");
  }

  if (!projectId) {
    throw new Error("プロジェクトIDが必要です。");
  }

  try {
    // 1. クエリを埋め込みベクトルに変換
    const vector = await getEmbedding(query);

    // 2. Qdrantに検索リクエスト送信
    const searchResults = await searchVectors(vector, projectId, topK);

    if (!searchResults.length) {
      return [];
    }

    // 3. 取得した結果からresource_idを抽出
    const resourceIds = searchResults
      .filter(result => result.payload && result.payload.resource_id)
      .map(result => result.payload!.resource_id as string);

    // 4. resource_idとproject_idを検索条件にfile_treesテーブルからマッチしたレコードを取得
    // IN句を使用して1回のクエリで複数のresource_idに対するデータを取得
    const placeholders = resourceIds.map(() => '?').join(',');
    const fileTreesQuery = `
      SELECT
        id,
        project_id,
        resource_id,
        domain,
        name,
        type,
        path,
        parent
      FROM file_trees
      WHERE resource_id IN (${placeholders}) AND project_id = ?
    `;

    // パラメータ配列を作成（最後にprojectIdを追加）
    const fileTreeParams = [...resourceIds, projectId];
    const fileTreesResults = await db.prepare(fileTreesQuery).all(fileTreeParams) as FileTreeEntry[];

    // resource_idをキーにしたマップを作成
    const fileTreeMap = new Map<string, FileTreeEntry>();
    fileTreesResults.forEach(fileTree => {
      fileTreeMap.set(fileTree.resource_id, fileTree);
    });

    // 5. resource_idを条件にtranslationsテーブルからマッチしたレコードを取得
    // IN句を使用して1回のクエリで複数のresource_idに対するデータを取得
    const translationsQuery = `
      SELECT
        id,
        resource_id,
        title,
        summary,
        description,
        text,
        original_text,
        language,
        keywords,
        timestamp
      FROM translations
      WHERE resource_id IN (${placeholders})
    `;

    const translationsResults = await db.prepare(translationsQuery).all(resourceIds) as TranslationEntry[];

    // resource_idをキーにしたマップを作成
    const translationMap = new Map<string, TranslationEntry>();
    translationsResults.forEach(translation => {
      translationMap.set(translation.resource_id, translation);
    });

    // 6. 検索結果を整形
    const results: SearchResult[] = searchResults.map((result, index) => {
      const resourceId = result.payload?.resource_id as string | undefined
      if (!resourceId) {
        return null;
      }
      const fileTree = fileTreeMap.get(resourceId);
      const translation = translationMap.get(resourceId);
      if (!fileTree || !translation) {
        return null;
      }

      // FileTreeEntryからSearchTreeNodeへの変換
      const searchNode: SearchResult = {
        id: fileTree.id,
        name: fileTree.name,
        path: fileTree.path,
        hitText: result.payload?.original_text as string || "",
        score: result.score,
      };

      return searchNode;
    }).filter(Boolean) as SearchResult[];

    // 7. キャッシュをリフレッシュ
    revalidatePath("/search");

    return results;
  } catch (error) {
    console.error("Error in searchDocuments:", error);
    throw new Error("検索処理中にエラーが発生しました。");
  }
}
