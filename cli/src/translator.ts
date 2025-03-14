import { ResponseSchema, SchemaType } from "@google/generative-ai";
import { logger } from "./logger";
import { model } from "./genAIClient";
import { extractValidJson } from "./utils/generateStructuredContent";
import { LanguageName } from "./domain/language";
import { TranslationResult } from "./domain/translation";


// 翻訳スタイルの型を定義
type TranslationStyle = "formal" | "technical" | "simplified";

// 翻訳関数
export const translate = async (
  text: string,
  language: LanguageName,
  preferredStyle: TranslationStyle = "technical" // デフォルトを "technical" に設定
): Promise<TranslationResult> => {
  const prompt = `
  あなたは技術文書を翻訳するプロフェッショナルです。以下の技術文書を分析した後、**${language}** に翻訳してください。
  
  ### **Step 1: 技術文書の分析**
  1. **主要な主張（Key Claims）**:
     - この文書が伝えようとしている **最も重要なポイント** を3〜5個特定する。
  
  2. **技術用語リスト（Terminology）**:
     - 文中に登場する **専門用語・技術用語・固有名詞** をリストアップする。
     - それぞれ **${language} での推奨翻訳（またはそのままの用語）** を提供する。
     - 翻訳する際に **略語や特定の業界用語が含まれる場合は適切な訳語を選定する**。
  
  3. **誤訳リスクの指摘（Translation Risks）**:
     - この技術文書を **${language}** に翻訳する際に発生しうる **誤訳のリスク** を特定する。
     - 特に **曖昧な表現・文化的な違い・業界ごとの用語の違い** に注意する。
  
  4. **翻訳スタイルの選択（Translation Style）**:
     - **優先スタイルとして "${preferredStyle}" を使用する。**
       - "formal"（フォーマルな翻訳）
       - "technical"（技術的な翻訳、専門用語を重視）
       - "simplified"（簡易的な翻訳、初心者向け）
  
  ### **Step 2: 翻訳**
  1. **翻訳の方針**:
     - 先ほどの分析結果をもとに、**${language} に正確に翻訳する**。
     - **専門用語の訳語を統一** し、誤訳を防ぐ。
     - 誤訳リスクを回避するよう意識する。
     - **翻訳スタイルは "${preferredStyle}" を採用**。

  **対象文書:**
  <Content>
  ${text}
  </Content>

  **出力フォーマット（JSON形式）:**
  `;

  // スキーマ定義
  const schema: ResponseSchema = {
    description: "技術文書の翻訳結果",
    type: SchemaType.OBJECT,
    properties: {
      claims: {
        type: SchemaType.ARRAY,
        description: "主要な主張",
        items: {
          type: SchemaType.STRING,
        },
      },
      terminology: {
        type: SchemaType.ARRAY,
        description: "技術用語リスト",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            term: { type: SchemaType.STRING, description: "原文の用語" },
            translation: { type: SchemaType.STRING, description: "推奨翻訳" },
          },
          required: ["term", "translation"],
        },
      },
      translationStyle: {
        type: SchemaType.STRING,
        description: "採用された翻訳スタイル",
        enum: ["formal", "technical", "simplified"],
        format: "enum",
      },
      translatedText: {
        type: SchemaType.STRING,
        description: "翻訳された文章",
      },
    },
    required: ["claims", "terminology", "translationStyle", "translatedText"],
  };


  const schemaModel = model(schema);

  try {
    const res = await schemaModel.generateContent(prompt);
    const resText = await res.response.text();
    return extractValidJson(resText);
  } catch (error) {
    logger.error(`Translation failed: ${error}`);
    throw new Error(`Translation failed: ${error}`);
  }
};
