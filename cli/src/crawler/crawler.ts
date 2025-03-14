import fs from 'fs';
import { URL } from 'url';
import * as cheerio from 'cheerio';
import { logger } from '../logger';
import { SitemapEntry } from '../domain/types';
import { fetchHTML, saveHTMLToFile } from './htmlUtils';
import { validateLink } from './linkProcessor';
import { normalizeUrl } from './urlUtils';
import { getHtmlFilePath } from '../path';

async function getHTML(url: string, forceFetch: boolean = false): Promise<string | null> {
  try {
    const filepath = getHtmlFilePath(url);

    if (!forceFetch && fs.existsSync(filepath)) {
      logger.info(`キャッシュからHTMLを取得: ${url}`);
      return fs.readFileSync(filepath, 'utf-8');
    } else {
      if (forceFetch) {
        logger.info(`--force-fetchが指定されたため、HTMLを再取得: ${url}`);
      }
    }

    const html = await fetchHTML(url);
    if (html) {
      saveHTMLToFile(html, filepath);
    }

    return html;
  } catch (error) {
    logger.error(`HTMLの取得中にエラーが発生: ${url}`);
    throw new Error(`Failed to fetch HTML for ${url}: ${error}`);
  }
}

async function crawlPage(
  url: string,
  depth: number = 2,
  allowedDomains: string[] = [],
  currentDepth: number = 1,
  forceFetch: boolean = false
): Promise<SitemapEntry[]> {
  try {
    logger.info(`Crawling ${url} at depth ${currentDepth}`);
    const html = await getHTML(url, forceFetch);
    if (!html) {
      logger.error(`Failed to fetch HTML for ${url}`);
      return [];
    }

    if (currentDepth > depth) {
      logger.info(`Reached maximum depth of ${depth} at ${url}`);
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
      const link = validateLink(href, url, depth, currentDepth, allowedDomains);
      if (link && link.fetch) {
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
        const nestedLinks = await crawlPage(
          absoluteUrl,
          depth,
          allowedDomains,
          currentDepth + 1,
          forceFetch
        );
        for (let nestedLink of nestedLinks) {
          const normalizedNestedLinkUrl = normalizeUrl(nestedLink.url);
          if (!uniqueUrls.has(normalizedNestedLinkUrl)) {
            uniqueUrls.add(normalizedNestedLinkUrl);
            links.push(nestedLink);
          }
        }
      } catch (error) {
        logger.error(`Error processing link ${link.url} : ${error}`);
      }
    }

    return links.filter(link => link.fetch);

  } catch (error) {
    logger.error(`Error crawling page ${url}: ${error}`);
    return [];
  }
}

export { getHTML, crawlPage };
