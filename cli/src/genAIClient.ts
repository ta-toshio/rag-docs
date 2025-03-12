import { GoogleGenerativeAI, ResponseSchema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const model = (schema: ResponseSchema) => {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
}