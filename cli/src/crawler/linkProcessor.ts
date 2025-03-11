import { URL } from 'url';
import * as cheerio from 'cheerio';
import { SitemapEntry } from '../types';
import { isLinkAllowed, normalizeUrl } from './urlUtils';

function processLink(href: string, url: string, depth: number, currentDepth: number, allowedDomains: string[]): SitemapEntry | null {
  try {
    const absoluteUrl = new URL(href, url).toString();
    const parsedUrl = new URL(absoluteUrl);

    if (!isLinkAllowed(parsedUrl, url, allowedDomains)) return null;

    const title = cheerio.load(href).text().trim();
    const normalizedBaseUrl = normalizeUrl(absoluteUrl);

    const fetchFlag = currentDepth < depth;

    return { url: normalizedBaseUrl, title: title, fetch: fetchFlag };
  } catch (error) {
    console.error(`Error processing link ${href} on page ${url}:`, error);
    return null;
  }
}

export { processLink };