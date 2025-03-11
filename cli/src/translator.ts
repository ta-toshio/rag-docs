// Google Gemini APIで翻訳

import { translatePrompt } from "./prompts";
import { model } from './genAIClient';

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