"use server";

import { searchVectors } from "@/infrastructure/vector/qdrant";
import { getEmbedding } from "@/infrastructure/llm/gemini";
import { revalidatePath } from "next/cache";
import sqlite from "@/infrastructure/db/sqlite";
import { TranslationEntry } from "@/domain/translation";
import { FileTreeEntry } from "@/domain/file-tree";
import { getFileTreesByResourceIds } from "@/infrastructure/db/file-tree";
import { getTranslationsByResourceIds } from "@/infrastructure/db/translation";

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
  const topK = Number(formData.get("topK")) || 20;

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
    const fileTreesResults = await getFileTreesByResourceIds(resourceIds, projectId);

    // resource_idをキーにしたマップを作成
    const fileTreeMap = new Map<string, FileTreeEntry>();
    fileTreesResults.forEach(fileTree => {
      fileTreeMap.set(fileTree.resource_id, fileTree);
    });

    // 5. resource_idを条件にtranslationsテーブルからマッチしたレコードを取得
    const translationsResults = await getTranslationsByResourceIds(resourceIds);

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
