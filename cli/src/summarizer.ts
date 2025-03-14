// Google Gemini APIで要約
import { ResponseSchema, SchemaType } from "@google/generative-ai";
import { logger } from "./logger";
import { model } from "./genAIClient";
import { extractValidJson } from "./utils/generateStructuredContent";
import { LanguageName } from "./domain/language";

// 分析結果の型定義
interface SummarizationResult {
  noises: string[];
  claims: {
    text: string;
    source?: string;
    evidence: string;
    certainty: string;
  }[];
  claimValidation: {
    claim: string;
    relevance: string;
    insights: string[];
    suggestions: string[];
  }[],
  summary: string;
  title: string;
  keywords: string[];
}

const schema: ResponseSchema = {
  description: "公式ドキュメントの要約解析結果",
  type: SchemaType.OBJECT,
  properties: {
    // **Step 1: ノイズ除去**
    noises: {
      type: SchemaType.ARRAY,
      description: "取り除くべきノイズ（冗長な説明、古い情報、広告など）",
      items: { type: SchemaType.STRING },
    },

    // **Step 2: 技術的な要点の抽出**
    claims: {
      type: SchemaType.ARRAY,
      description: "文書内の技術的な要点を抽出する",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING, description: "技術的な要点の説明" },
          source: { type: SchemaType.STRING, description: "公式ドキュメント内の該当記述" },
          evidence: { type: SchemaType.STRING, description: "記述の根拠（仕様書・標準など）" },
          applicability: { type: SchemaType.STRING, description: "適用対象（OS、バージョン、環境）" },
        },
        required: ["text", "source", "evidence", "applicability"],
      },
    },

    // **Step 3: 初回要約（description）**
    description: {
      type: SchemaType.STRING,
      description: "1000文字以内の初回要約。文書の概要を簡潔にまとめたもの。",
    },

    // **Step 4: 技術要点の検証**
    claimValidation: {
      type: SchemaType.ARRAY,
      description: "各技術要点（claims）に対する検証結果",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          claim: {
            type: SchemaType.STRING,
            description: "検証する技術的な要点の内容",
          },
          relevance: {
            type: SchemaType.STRING,
            description: "この要点が文書の要約 (description) にどの程度関連しているか",
          },
          insights: {
            type: SchemaType.ARRAY,
            description: "開発者が意識すべきポイントや注意点",
            items: { type: SchemaType.STRING },
          },
          suggestions: {
            type: SchemaType.ARRAY,
            description: "推奨される設定、トラブルシューティングのヒント",
            items: { type: SchemaType.STRING },
          },
        },
      },
    },

    // **Step 5: 最終要約（summary）**
    summary: {
      type: SchemaType.STRING,
      description: "3000文字以内の最終要約。Step 4 で検証・精査した技術要点を反映し、" +
        "要点毎に見出しをつけ、要約をマークダウン形式で記述する。`# 見出し`",
    },
    keywords: {
      type: SchemaType.ARRAY,
      description: "文書の重要なキーワード",
      items: { type: SchemaType.STRING },
    },
    title: {
      type: SchemaType.STRING,
      description: "文書のタイトル",
    },
  },
  required: ["claims", "noises", "claimValidation", "summary", "title", "keywords"],
};


// **文書分析関数**
export const summarize = async (content: string, language: LanguageName): Promise<SummarizationResult> => {
  const prompt = `
あなたは公式ドキュメントを要約し、技術的な要点を抽出する専門的な解析システムです。  
与えられた文書を分析し、技術者が必要とする情報のみを整理し、**${language}** で出力してください。

---

### **Step 1: ノイズの除去**
- **不要な情報を取り除く**（冗長な説明、古い情報、広告、宣伝など）。  
- **重要な技術的なポイントのみを抽出** し、関連性の低い情報を除外する。

---

### **Step 2: 技術的な要点の抽出**
- **文書内の主要な技術的な要点（claims）を抽出する**。
  - **API仕様:** パラメータ、レスポンス、制約など  
  - **設定値:** デフォルト値、推奨値、環境ごとの違い  
  - **適用環境:** OS、バージョン、依存関係  
- **各要点について、以下の情報を記述する:**
  - **技術的な要点の説明**
  - **該当する公式ドキュメント内の記述**
  - **記述の根拠（仕様書・標準など）**
  - **適用対象（特定の環境やバージョン）**

---

### **Step 3: 初回要約（description）**
- **1000文字以内で簡潔に要約（description）**  
- **文書全体の構造を捉え、技術的なポイントを網羅的にまとめる**  
- **この時点では詳細な検証を行わず、文書の主要な内容を把握することに重点を置く**  

---

### **Step 4: 技術要点の検証**
- **Step 3 の要約（description）を元に技術要点を再評価し、適切性を検証する。**
- **各要点（claims）に対して:**
  - **要点の内容を確認**
  - **要約との関連性を検証**
- **このステップで技術的な誤りや不足を補い、正確な情報を整理する。**

---

### **Step 5: 最終要約（summary）**
- **Step 4 で検証・精査した技術要点を反映し、最終的な3000文字以内の情報量を減らさず要点毎に見出しをつけ要約をマークダウン形式で記述する。**
- **技術者にとって必要な情報を分かりやすく整理し、網羅的かつ簡潔に表現する。**
- **翻訳の誤訳を防ぐため、技術用語の統一を徹底する**（例："キャッシュ" vs "cache"）。

---

**対象文章:**
<Content>
${content}
</Content>

**出力フォーマット（JSON形式）を厳守し、**${language}** で出力すること:**
`;

  const schemaModel = model(schema);

  try {
    // Gemini API にリクエスト
    const res = await schemaModel.generateContent(prompt);
    const resText = await res.response.text();

    // JSON のパースと整合性チェック
    return extractValidJson(resText);
  } catch (error) {
    logger.error(`Summarization failed: ${error}`);
    throw new Error("Summarization failed");
  }
};
