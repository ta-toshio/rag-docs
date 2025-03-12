import fs from 'fs';
import path from 'path';
import { logger } from './logger';

async function saveSitemapToFile(sitemap: any[], url: string): Promise<void> {
  try {
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
    logger.error(`サイトマップの保存中にエラーが発生:`, error);
  }
}

async function writeFile(data: string, url: string, subDirectory: string, fileExtension: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const pathDir = path.dirname(urlObj.pathname);
    const parentDir = path.basename(pathDir); // 空文字列でも許容
    const baseOutput = path.join('output', domain, subDirectory);
    const outputPath = parentDir ? path.join(baseOutput, parentDir) : baseOutput;
    const filename = path.basename(urlObj.pathname).replace('.html', '') || 'index';
    const filepath = path.join(outputPath, `${filename}.${fileExtension}`);

    fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(filepath, data, 'utf-8');

    logger.info(`${subDirectory} ファイルを保存: ${filepath}`);
  } catch (error) {
    logger.error(`${subDirectory} ファイルの保存中にエラーが発生: ${error}`);
  }
}

async function saveMarkdownToFile(markdown: string, url: string): Promise<void> {
  await writeFile(markdown, url, 'markdown', 'md');
}

async function saveTranslationToFile(translatedText: string, url: string): Promise<void> {
  await writeFile(translatedText, url, 'translation', 'md');
}

async function saveSummarizationToFile(summary: string, url: string): Promise<void> {
  await writeFile(summary, url, 'summary', 'md');
}

export { saveSitemapToFile, saveMarkdownToFile, saveTranslationToFile, saveSummarizationToFile };