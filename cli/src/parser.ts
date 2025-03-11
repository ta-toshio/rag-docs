// HTML / テキスト → Markdown変換
// @see .roo/docs/toMarkdown.md

import TurndownService from 'turndown';
import * as cheerio from 'cheerio';

export function removeUnnecessaryTags(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header').remove();
  return $.html();
}

export function convertMarkdownFormat(html: string): string {
  const turndownService = new TurndownService();
  return turndownService.turndown(html);
}

export function processImagesAndLinks(html: string): string {
  // TODO: 画像とリンクの処理を実装
  return html;
}

export async function htmlToMarkdown(html: string): Promise<string> {
  let processedHtml = removeUnnecessaryTags(html);
  processedHtml = convertMarkdownFormat(processedHtml);
  processedHtml = processImagesAndLinks(processedHtml);
  return processedHtml;
}