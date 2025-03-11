// Google Gemini APIで要約

import { summarizePrompt } from "./prompts";
import { model } from './genAIClient';

export async function summarize(text: string): Promise<string> {
  try {
    const prompt = summarizePrompt(text);
    const result = await model.generateContent(prompt)
    const response = await result.response;
    const summarizedText = response.text();
    return summarizedText;
  } catch (error) {
    console.error("Summarization error:", error);
    return text;
  }
}