// src/fileWriter.test.ts

import fs from 'fs';
import path from 'path';
import { saveSitemapToFile, saveSummarizationToFile } from './fileWriter';
import { describe, expect, it } from 'vitest';
import { getSummarizationFilePath } from './path';

describe('saveSitemapToFile', () => {
  it('should save the sitemap to a JSON file', async () => {
    const url = 'https://docs.roocode.com';
    const sitemap = [
      { url: 'https://docs.roocode.com', title: 'Home', fetch: true },
      { url: 'https://docs.roocode.com/getting-started', title: 'Getting Started', fetch: false },
    ];

    await saveSitemapToFile(sitemap, url);

    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const filepath = path.join('output', domain, 'sitemap.json');

    expect(fs.existsSync(filepath)).toBe(true);

    const savedSitemap = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    expect(savedSitemap).toEqual(sitemap);
  });
});

describe('saveSummarizationToFile', () => {
  it('should save the summary to a markdown file', async () => {
    const url = 'https://example.com/test-page';
    const summaryContent = '# Summary of Test Page';
    const outputPath = getSummarizationFilePath(url)

    await saveSummarizationToFile(summaryContent, outputPath);

    expect(fs.existsSync(outputPath)).toBe(true);
    expect(fs.readFileSync(outputPath, 'utf-8')).toBe(summaryContent);
  });
});