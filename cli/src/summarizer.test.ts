import { summarize } from "./summarizer";
import { describe, expect, it, vi } from "vitest";
import fs from "fs";
import path from "path";
import { getLanguageName } from './types/language';

// モック: Google Generative AI API のレスポンスをシミュレート
// APIを実行したい場合は、コメントアウトしてください
vi.mock("./genAIClient", () => ({
  model: vi.fn(() => ({
    generateContent: vi.fn(async () => ({
      response: {
        text: async () =>
          JSON.stringify({
            noises: ["広告", "古い情報"],
            claims: [
              { text: "技術的な要点1", source: "ドキュメント A", evidence: "仕様書 B", certainty: "高" },
            ],
            claimValidation: [
              {
                claim: "技術的な要点1",
                relevance: "高い",
                insights: ["注意点1"],
                suggestions: ["設定変更を推奨"],
              },
            ],
            summary: "これは要約された公式ドキュメントの内容です。カスタムモード custom modes",
            title: "サンプルドキュメント",
            keywords: ["API", "設定", "最適化"],
          }),
      },
    })),
  })),
}));

// テスト用のMarkdownファイルを読み込む
const testMd = fs.readFileSync(path.join(__dirname, "resources/tests/test.md"), "utf-8");

describe("summarize", () => {
  it("should summarize a markdown document in Japanese", async () => {
    const language = "ja";
    const result = await summarize(testMd, getLanguageName(language));

    // 期待される JSON スキーマ形式を確認
    expect(result).toHaveProperty("summary");
    expect(result.summary).toContain("カスタムモード");

    expect(result).toHaveProperty("claims");
    expect(result.claims).toBeInstanceOf(Array);
    expect(result.claims.length).toBeGreaterThan(0);

    expect(result).toHaveProperty("claimValidation");
    expect(result.claimValidation).toBeInstanceOf(Array);

    expect(result).toHaveProperty("keywords");
    expect(result.keywords).toBeInstanceOf(Array);
    expect(result.keywords.length).toBeGreaterThan(0);

    console.log(result);
  });

  it("should return valid summary structure for English", async () => {
    const language = "en";
    const result = await summarize(testMd, getLanguageName(language));

    expect(result).toHaveProperty("summary");
    expect(result.summary).toContain("custom modes");

    expect(result).toHaveProperty("claims");
    expect(result.claims).toBeInstanceOf(Array);
    expect(result.claims.length).toBeGreaterThan(0);

    expect(result).toHaveProperty("claimValidation");
    expect(result.claimValidation).toBeInstanceOf(Array);

    expect(result).toHaveProperty("keywords");
    expect(result.keywords).toBeInstanceOf(Array);
    expect(result.keywords.length).toBeGreaterThan(0);
  });

});
