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