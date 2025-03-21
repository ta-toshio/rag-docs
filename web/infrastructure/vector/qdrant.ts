import { QdrantClient } from "@qdrant/js-client-rest";

// Qdrantクライアントの設定
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  // apiKey: process.env.QDRANT_API_KEY,
});

// ベクトル検索関数
export async function searchVectors(
  vector: number[],
  projectId: string,
  topK: number = 5
) {
  try {
    return await qdrantClient.search("vector_collection", {
      vector,
      limit: topK,
      // filter: {
      //   must: [{ key: "project_id", match: { value: projectId } }]
      // }
    });
  } catch (error) {
    console.error("Error in searchVectors:", error);
    return [];
  }
}

export { qdrantClient };