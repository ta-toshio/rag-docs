import path from 'path';
import fs from 'fs';
import { SitemapEntry } from './domain/types';

export const getHtmlFilePath = (url: string): string => {
    return getFilePath(url, 'html', 'html');
};

export const getMarkdownFilePath = (url: string): string => {
    return getFilePath(url, 'markdown', 'md');
};

export const getTranslationFilePath = (url: string): string => {
    return getFilePath(url, 'translation', 'md');
};

export const getSummarizationFilePath = (url: string): string => {
    return getFilePath(url, 'summary', 'md');
};

// Returns the full file path based on the URL, subdirectory, and file extension
export function getFilePath(url: string, subDirectory: string, fileExtension: string): string {
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const pathDir = path.dirname(urlObj.pathname);
  const parentDir = path.basename(pathDir); // 空文字列でも許容
  const baseOutput = path.join('output', domain, subDirectory);
  const outputPath = parentDir ? path.join(baseOutput, parentDir) : baseOutput;
  const filename = path.basename(urlObj.pathname).replace('.html', '') || 'index';
  return path.join(outputPath, `${filename}.${fileExtension}`);
}

export function getFilePathFromUrl(url: string): string {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  const outputPath = path.join('output', domain, 'html', parsedUrl.pathname);
  const filename = path.basename(parsedUrl.pathname) || 'index';
  return path.join(outputPath, `${filename}.html`);
}

interface HtmlFilePath {
  path: string;
  url: string;
  fetch: boolean;
}

export function getHtmlFilePathsFromSitemap(sitemapPath: string): HtmlFilePath[] {
  try {
    const sitemapJson = fs.readFileSync(sitemapPath, 'utf-8');
    const sitemap: SitemapEntry[] = JSON.parse(sitemapJson);
    return sitemap.map(entry => {
      const filepath = getFilePathFromUrl(entry.url);
      return {
        path: filepath,
        url: entry.url,
        fetch: entry.fetch
      };
    });
  } catch (error) {
    console.error(`Error reading or parsing sitemap.json: ${error}`);
    return [];
  }
}
