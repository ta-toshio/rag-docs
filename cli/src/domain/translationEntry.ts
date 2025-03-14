import { TranslationResult } from "./translation";
import { SummarizationResult } from "./summarization";
import { v7 as uuidv7 } from 'uuid';
import { LanguageName } from "./language";

export interface TranslationEntry {
  id: string;          // ユニークな識別子 (reference をそのまま使う)
  resource_id: string; // リソースの場所
  title: string;       // ドキュメントのタイトル
  summary: string;     // 翻訳された要約テキスト
  description: string | null; // 詳細な説明（メタデータ）
  text: string;        // 翻訳済みテキスト
  original_text: string; // 元の英語テキスト
  language: string;    // 言語 (例: "ja", "en")
  keywords: string | null;  // キーワードリスト (JSON 形式の文字列)
  timestamp: string;   // 取得日時
}

export function factoryTranslationEntry(
  url: string,
  translation: TranslationResult,
  summary: SummarizationResult,
  originalText: string,
  language: LanguageName,
): TranslationEntry {
  return {
    id: uuidv7(),
    resource_id: url,
    title: summary.title,
    summary: summary.summary,
    description: summary.description,
    text: translation.translatedText,
    original_text: originalText,
    language: language,
    keywords: summary.keywords?.join(','),
    timestamp: new Date().toISOString()
  };
}
