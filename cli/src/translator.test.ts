import { translate } from './translator';
import { describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getLanguageName } from './domain/language';

// モック: Google Generative AI API 呼び出しをシミュレート
vi.mock("./genAIClient", () => ({
  model: vi.fn(() => ({
    generateContent: vi.fn(async () => ({
      response: {
        text: async () =>
          JSON.stringify({
            claims: ["技術的な主張 1", "技術的な主張 2"],
            terminology: [{ term: "API", translation: "Application Programming Interface" }],
            translationStyle: "technical",
            translatedText: "これは翻訳された文章です。Roo Code",
          }),
      },
    })),
  })),
}));

// テスト用のMarkdownファイルを読み込む
const testMd = fs.readFileSync(path.join(__dirname, 'resources/tests/test.md'), 'utf-8');

describe('translate', () => {
  it('should translate markdown text to Japanese', async () => {
    const language = 'ja';
    const result = await translate(testMd, getLanguageName(language));

    // 期待する JSON スキーマ形式を確認
    expect(result).toHaveProperty('translatedText');
    expect(result.translatedText).toContain('Roo Code'); // 翻訳された内容の検証

    expect(result).toHaveProperty('claims');
    expect(result.claims).toBeInstanceOf(Array);

    expect(result).toHaveProperty('terminology');
    expect(result.terminology).toBeInstanceOf(Array);
    expect(result.terminology.length).toBeGreaterThan(0);

    expect(result).toHaveProperty('translationStyle');
    expect(['formal', 'technical', 'simplified']).toContain(result.translationStyle);
  });

  it('should translate markdown text to English', async () => {
    const language = 'en';
    const result = await translate(testMd, getLanguageName(language));

    expect(result).toHaveProperty('translatedText');
    expect(result.translatedText).toContain('Roo Code'); // 英語でも含まれるはずの単語をチェック

    expect(result).toHaveProperty('claims');
    expect(result.claims).toBeInstanceOf(Array);

    expect(result).toHaveProperty('terminology');
    expect(result.terminology).toBeInstanceOf(Array);
    expect(result.terminology.length).toBeGreaterThan(0);

    expect(result).toHaveProperty('translationStyle');
    expect(['formal', 'technical', 'simplified']).toContain(result.translationStyle);
  });

});
