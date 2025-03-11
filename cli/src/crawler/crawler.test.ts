// src/crawler.test.ts

import { crawlPage } from './crawler';
import { describe, expect, it } from 'vitest';

// src/crawler.test.ts


describe('crawlPage', () => {
  it('should crawl a page and return a sitemap with depth 1', async () => {
    const url = 'https://docs.roocode.com';
    const depth = 1;
    const sitemap = await crawlPage(url, depth);

    expect(sitemap).toBeDefined();
    expect(sitemap.length).toBeGreaterThan(0);
    sitemap.forEach(entry => {
      expect(entry.url).toBeDefined();
      expect(entry.title).toBeDefined();
      expect(entry.fetch).toBeDefined();
    });
  });

  it('should include the specific URL in the sitemap', async () => {
    const url = 'https://docs.roocode.com';
    const depth = 2;
    const sitemap = await crawlPage(url, depth);

    expect(sitemap).toBeDefined();
    expect(sitemap.some(entry => entry.url === 'https://docs.roocode.com/advanced-usage/local-models')).toBe(true);
  });

  it('should handle non-existent pages gracefully', async () => {
    const url = 'https://non-existent.com';
    const depth = 1;
    const sitemap = await crawlPage(url, depth);

    expect(sitemap).toBeDefined();
    expect(sitemap).toEqual([]);
  });

  it('should not include external links in the sitemap', async () => {
    const url = 'https://docs.roocode.com';
    const depth = 1;
    const sitemap = await crawlPage(url, depth);

    expect(sitemap).toBeDefined();
    sitemap.forEach(entry => {
      expect(entry.url.startsWith('https://docs.roocode.com')).toBe(true);
    });
  });

  it('should set fetch flag to true for the top page and false for the linked pages when depth is 1', async () => {
    const url = 'https://docs.roocode.com';
    const depth = 1;
    const sitemap = await crawlPage(url, depth);

    expect(sitemap).toBeDefined();
    expect(sitemap.length).toBeGreaterThan(0);

    const topPage = sitemap.find(entry => entry.url === url);
    expect(topPage).toBeDefined();
    expect(topPage.fetch).toBe(true);

    sitemap.filter(entry => entry.url !== url).forEach(entry => {
      expect(entry.fetch).toBe(false);
    });
  });


  // it.only('should save the sitemap to a JSON file', async () => {
  //   const url = 'https://docs.roocode.com';
  //   const depth = 1;
  //   const sitemap = await crawlPage(url, depth);

  //   expect(sitemap).toBeDefined();
  //   expect(sitemap.length).toBeGreaterThan(0);

  //   await saveSitemapToFile(sitemap, url);

  //   const path = require('path');
  //   const parsedUrl = new URL(url);
  //   const domain = parsedUrl.hostname;
  //   const filepath = path.join('output', domain, 'sitemap.json');
  //   console.log(filepath);

  //   expect(fs.existsSync(filepath)).toBe(true);

  //   const savedSitemap = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  //   expect(savedSitemap).toEqual(sitemap);
  // });
});