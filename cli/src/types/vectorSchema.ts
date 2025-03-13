export interface VectorEntry {
  id: string;          // ✅ ユニークな識別子 (ドキュメントの識別子 + 段落番号)
  resource_id: string;     // ✅ translation_collection の resource_id に対応
  paragraph_index: number;
  vector: number[];    // ✅ 埋め込みベクトル (Google Gemini API, 768次元)
  original_text: string; // ✅ 元のテキスト
  language: string;    // ✅ 言語 (例: "ja", "en")
  timestamp: string;   // 取得日時
}