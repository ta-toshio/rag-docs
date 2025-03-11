// HTML / テキスト → Markdown変換
// @see .roo/docs/toMarkdown.md

import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { SitemapEntry } from '../types';

export function processImagesAndLinks(html: string): string {
  // TODO: 画像とリンクの処理を実装
  return html;
}

export function getHtmlFilePathsFromSitemap(sitemapPath: string): {url: string, fetch: boolean}[] {
  try {
    const sitemapJson = fs.readFileSync(sitemapPath, 'utf-8');
    const sitemap: SitemapEntry[] = JSON.parse(sitemapJson);
    const htmlFilePaths: {url: string, fetch: boolean}[] = sitemap.map(entry => {
      const parsedUrl = new URL(entry.url);
      const domain = parsedUrl.hostname;
      const outputPath = path.join('output', domain, 'html', parsedUrl.pathname);
      const filename = path.basename(parsedUrl.pathname) || 'index';
      const filepath = path.join(outputPath, `${filename}.html`);
      return {url: filepath, fetch: entry.fetch};
    });
    return htmlFilePaths;
  } catch (error) {
    console.error(`Error reading or parsing sitemap.json: ${error}`);
    return [];
  }
}

export async function readHtmlFiles(url: string): Promise<{ url: string; htmlContent: string }[]> {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const sitemapPath = path.join('output', domain, 'sitemap.json');
    const sitemapJson = fs.readFileSync(sitemapPath, 'utf-8');
    const sitemap: SitemapEntry[] = JSON.parse(sitemapJson);
    const htmlFilePaths = getHtmlFilePathsFromSitemap(sitemapPath).filter(entry => entry.fetch);

    if (htmlFilePaths.length === 0) {
      console.warn(`No HTML file paths found in sitemap.json: ${sitemapPath}`);
      return [];
    }

    const htmlContents: { url: string; htmlContent: string }[] = [];
    for (const entry of htmlFilePaths) {
      try {
        const htmlContent = fs.readFileSync(entry.url, 'utf-8');
        htmlContents.push({ url: entry.url, htmlContent });
      } catch (error) {
        console.error(`Error reading HTML file: ${entry.url}`, error);
      }
    }

    return htmlContents;
  } catch (error) {
    console.error(`Error reading HTML files from sitemap: ${error}`);
    return [];
  }
}

export function parseHtmlToDOM(html: string): CheerioAPI {
  try {
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header').remove();
    return $;
  } catch (error) {
    console.error(`Error parsing HTML to DOM: ${error}`);
    return null as any; // TODO: null を返さないように修正する
  }
}

//export function removeUnnecessaryTags(html: string): string {
//  const $ = cheerio.load(html);
//  $('script, style, nav, footer, header').remove();
//  return $.html();
//}