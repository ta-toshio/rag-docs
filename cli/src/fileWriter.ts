import fs from 'fs';
import path from 'path';
import { logger } from './logger';

function saveSitemapToFile(sitemap: any[], url: string): void {
  try {
    // @TODO リファクタリング
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const outputPath = path.join('output', domain);
    const filepath = path.join(outputPath, 'sitemap.json');

    fs.mkdirSync(outputPath, { recursive: true });
    try {
      fs.writeFileSync(filepath, JSON.stringify(sitemap, null, 2));
    } catch (e) {
      logger.error(`writeFileSync error: ${e}`);
    }
  } catch (error) {
    logger.error(`サイトマップの保存中にエラーが発生: ${error}`);
  }
}

function writeFile(data: string, filePath: string): void {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, data, 'utf-8');

    logger.info(`ファイルを保存: ${filePath}`);
  } catch (error) {
    logger.error(`${filePath} ファイルの保存中にエラーが発生: ${error}`);
  }
}

function saveMarkdownToFile(markdown: string, filePath: string): void {
  writeFile(markdown, filePath);
}

function saveTranslationToFile(translatedText: string, filePath: string): void {
  writeFile(translatedText, filePath);
}

function saveSummarizationToFile(summary: string, filePath: string): void {
  writeFile(summary, filePath);
}

export { saveSitemapToFile, saveMarkdownToFile, saveTranslationToFile, saveSummarizationToFile };