import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import * as cheerio from 'cheerio';
import { SitemapEntry } from '../types';
import { fetchHTML, saveHTMLToFile } from './htmlUtils';
import { processLink } from './linkProcessor';
import { normalizeUrl } from './urlUtils';

async function getHTML(url: string, forceFetch: boolean = false): Promise<string | null> {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const outputPath = path.join('output', domain, 'html', parsedUrl.pathname);
    const filename = path.basename(parsedUrl.pathname) || 'index';
    const filepath = path.join(outputPath, `${filename}.html`);

    if (!forceFetch && fs.existsSync(filepath)) {
      console.log(`キャッシュからHTMLを取得: ${url}`);
      return fs.readFileSync(filepath, 'utf-8');
    } else {
      if (forceFetch) {
        console.log(`--force-fetchが指定されたため、HTMLを再取得: ${url}`);
      }
    }

    const html = await fetchHTML(url);
    if (html) {
      saveHTMLToFile(html, filepath);
    }

    return html;
  } catch (error) {
    console.error(`HTMLの取得中にエラーが発生: ${url}`, error);
    return null;
  }
}

async function crawlPage(url: string, depth: number = 2, allowedDomains: string[] = [], currentDepth: number = 1, forceFetch: boolean = false): Promise<SitemapEntry[]> {
  try {
    console.log(`Crawling ${url} at depth ${currentDepth}`);
    const html = await getHTML(url, forceFetch);
    if (!html) {
      console.error(`Failed to fetch HTML for ${url}`);
      return [];
    }

    if (currentDepth > depth) {
      console.log(`Reached maximum depth of ${depth} at ${url}`);
      return [];
    }

    const $ = cheerio.load(html);
    const links: SitemapEntry[] = [];
    const uniqueUrls = new Set<string>();

    const normalizedUrl = normalizeUrl(url);
    links.push({ url: normalizedUrl, title: $('title').text().trim(), fetch: true });
    uniqueUrls.add(normalizedUrl);

    const elements = $('a[href]').toArray();
    for (let element of elements) {
      const href = $(element).attr('href');
      if (!href) continue;
      const link = processLink(href, url, depth, currentDepth, allowedDomains);
      if (link) {
        const normalizedLinkUrl = normalizeUrl(link.url);
        if (!uniqueUrls.has(normalizedLinkUrl)) {
          uniqueUrls.add(normalizedLinkUrl);
          links.push(link);
        }
      }
    }

    for (let link of links) {
      try {
        const absoluteUrl = new URL(link.url, url).toString();
        if (absoluteUrl.startsWith(url) && currentDepth < depth) {
          const nestedLinks = await crawlPage(absoluteUrl, depth, allowedDomains, currentDepth + 1, forceFetch);
          for (let nestedLink of nestedLinks) {
            const normalizedNestedLinkUrl = normalizeUrl(nestedLink.url);
            if (!uniqueUrls.has(normalizedNestedLinkUrl)) {
              uniqueUrls.add(normalizedNestedLinkUrl);
              links.push(nestedLink);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing link ${link.url} :`, error);
      }
    }

    console.log(`Found ${links.length} links on ${url}`);
    return links;

  } catch (error) {
    console.error(`Error crawling page ${url}:`, error);
    return [];
  }
}

export { getHTML, crawlPage };