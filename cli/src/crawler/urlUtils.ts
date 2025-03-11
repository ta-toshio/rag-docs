import { URL } from 'url';

function isLinkAllowed(parsedUrl: URL, baseUrl: string, allowedDomains: string[]): boolean {
  const baseParsedUrl = new URL(baseUrl);
  return parsedUrl.hostname === baseParsedUrl.hostname || allowedDomains.some(domain => parsedUrl.hostname === new URL(domain).hostname);
}

function normalizeUrl(url: string): string {
  const baseUrl = url.split('#')[0];
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

export { isLinkAllowed, normalizeUrl };