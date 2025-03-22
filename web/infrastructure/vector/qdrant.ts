import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION_NAME = "vector_collection";
const SCORE_THRESHOLD = 0.85;
// Qdrantクライアントの設定
export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  // apiKey: process.env.QDRANT_API_KEY,
});

// ベクトル検索関数
export async function searchVectors(
  vector: number[],
  projectId: string,
  topK: number = 20
) {
  try {
    return await qdrantClient.search(COLLECTION_NAME, {
      vector,
      limit: topK,
      filter: {
        must: [{ key: "project_id", match: { value: projectId } }]
      }
    });
  } catch (error) {
    console.error("Error in searchVectors:", error);
    return [];
  }
}

interface SearchResult {
  id: string;
  score: number;
}

interface SearchForRAGResult {
  highScoreDocs: SearchResult[];
  normalScoreDocs: SearchResult[];
}

export async function searchForRAG(
  vector: number[],
  projectId: string,
  topK: number = 10
): Promise<SearchForRAGResult> {
  try {
    const results = await qdrantClient.search(
      COLLECTION_NAME,
      {
        vector,
        limit: topK,
        filter: {
          must: [{ key: "project_id", match: { value: projectId } }]
        }
      }
    );

    const highScoreDocs = results
      .filter(res => 
        res.score >= SCORE_THRESHOLD &&
        res.payload &&
        res.payload.resource_id
      )
      .map(res => ({
        id: res.payload!.resource_id as string,
        score: res.score,
      }));

    const normalScoreDocs = results
      .filter(
        res => res.score < SCORE_THRESHOLD &&
        res.payload &&
        res.payload.resource_id
      )
      .map(res => ({
        id: res.payload!.resource_id as string,
        score: res.score,
      }));

    return { highScoreDocs, normalScoreDocs };
  } catch (error) {
    console.error("Error in searchQdrant:", error);
    return { highScoreDocs: [], normalScoreDocs: [] };
  }
}
