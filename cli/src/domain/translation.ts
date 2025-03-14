
// 型定義
export interface TranslationResult {
    claims: string[];
    terminology: { term: string; translation: string }[];
    translationStyle: "formal" | "technical" | "simplified";
    translatedText: string;
  }