// 言語コードの配列
const languageCodes = [
  "ja",
  "en",
  "fr",
  "de",
  "es",
  "zh",
  "zh_tw",
  "ko",
] as const;

// ISO 639-1 言語コードのリスト
export type LanguageCode = typeof languageCodes[number];

// 言語名のリテラル型
export type LanguageName =
  | "Japanese"
  | "English"
  | "French"
  | "German"
  | "Spanish"
  | "Chinese (Simplified)"
  | "Chinese (Traditional)"
  | "Korean";

// 言語コードマップ
export const languageMap: Record<LanguageCode, LanguageName> = {
  ja: "Japanese",
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  zh: "Chinese (Simplified)",
  zh_tw: "Chinese (Traditional)",
  ko: "Korean",
};

// 型安全な言語名取得関数
export const getLanguageName = (code: LanguageCode): LanguageName => {
  return languageMap[code];
};

export function isValidLanguageCode(language: string): language is LanguageCode {
  return (languageCodes as readonly string[]).includes(language);
}