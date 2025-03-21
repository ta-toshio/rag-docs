import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// Google Gemini APIの設定
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const embeddingModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004"
});

export const chatModel = new ChatGoogleGenerativeAI({
  model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GEMINI_API_KEY || "",
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
