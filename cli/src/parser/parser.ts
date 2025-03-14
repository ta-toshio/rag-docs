// HTML / テキスト → Markdown変換
// @see .roo/docs/toMarkdown.md

import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { HtmlContentEntry, SitemapEntry } from '../domain/types';
import { logger } from '../logger';
import { getHtmlFilePathsFromSitemap } from '../path';

export function processImagesAndLinks(html: string): string {
  // TODO: 画像とリンクの処理を実装
  return html;
}



export async function readHtmlFiles(url: string): Promise<HtmlContentEntry[]> {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const sitemapPath = path.join('output', domain, 'sitemap.json');
    const htmlFilePaths = getHtmlFilePathsFromSitemap(sitemapPath)
      .filter(entry => entry.fetch);

    if (htmlFilePaths.length === 0) {
      console.warn(`No HTML file paths found in sitemap.json: ${sitemapPath}`);
      return [];
    }
    logger.info(`htmlFilePaths: ${JSON.stringify(htmlFilePaths)}`);

    const htmlContents: HtmlContentEntry[] = [];
    for (const entry of htmlFilePaths) {
      try {
        const htmlContent = fs.readFileSync(entry.path, 'utf-8');
        htmlContents.push({ path: entry.path, url: entry.url, htmlContent });
      } catch (error) {
        console.error(`Error reading HTML file: ${entry.path}`, error);
      }
    }

    return htmlContents;
  } catch (error) {
    console.error(`Error reading HTML files from sitemap: ${error}`);
    return [];
  }
}


export function parseHtmlToDOM(html: string): CheerioAPI | null {
  try {
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    return $;
  } catch (error) {
    logger.error(`Error parsing HTML to DOM: ${error}`);
    return null;
  }
}
