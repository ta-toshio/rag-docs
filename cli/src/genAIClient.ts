import { GoogleGenerativeAI, ResponseSchema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const model = (schema: ResponseSchema) => {
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
}

export const embeddingModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
});