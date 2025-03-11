// Google Gemini APIで翻訳

import { GoogleGenerativeAI } from "@google/generative-ai";
import { translatePrompt } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function translate(text: string, language: string): Promise<string> {
  try {
    const prompt = translatePrompt(language, text);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}