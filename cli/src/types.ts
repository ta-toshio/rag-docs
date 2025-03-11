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