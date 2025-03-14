// 型定義

export interface CrawledPage {
  url: string;
  content: string;
  links: CrawledPage[];
}

export interface SitemapEntry {
  url: string;
  title: string;
  fetch: boolean;
}

export interface HtmlContentEntry {
  path: string;
  url: string;
  htmlContent: string;
}