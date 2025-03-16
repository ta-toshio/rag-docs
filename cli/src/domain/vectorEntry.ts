import { v7 as uuidv7 } from 'uuid';

export interface VectorEntry {
  id: string;          // ユニークな識別子 (ドキュメントの識別子 + 段落番号)
  resource_id: string;     // translations の resource_id に対応
  paragraph_index: number;
  vector: number[];    // 埋め込みベクトル (Google Gemini API, 768次元)
  original_text: string; // 元のテキスト
  language: string;    // 言語 (例: "ja", "en")
  timestamp: string;   // 取得日時
}

export function factoryVectorEntry(
  resource_id: string,
  paragraph_index: number,
  vector: number[],
  original_text: string,
  language: string,
): VectorEntry {
  return {
    // id: resource_id + "_p" + paragraph_index,
    id: uuidv7(),
    resource_id,
    paragraph_index,
    vector,
    original_text,
    language,
    timestamp: new Date().toISOString()
  };
}

