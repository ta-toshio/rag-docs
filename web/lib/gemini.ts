import { GoogleGenerativeAI } from "@google/generative-ai";

// Google Gemini APIの設定
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004"
});

// テキストを埋め込みベクトルに変換する関数
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding.values;
    return embedding;
  } catch (error) {
    console.error("Error in getEmbedding:", error);
    throw new Error("Failed to generate embedding");
  }
}