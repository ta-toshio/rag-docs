#!/usr/bin/env node

import { Command, Option } from 'commander';
import { downloadDocument } from './fileProcessor';
import { htmlToMarkdown } from './parser';
import { translate } from './translator';
import { crawlPage, getHTML } from './crawler/crawler';
import { SitemapEntry } from './types';
import { saveSitemapToFile } from './fileWriter';
import { sortByDirectory } from './sorter';

const program = new Command();

program
  .name('translate-docs')
  .description('Webドキュメント翻訳・要約・検索システム')
  .version('1.0.0');

program.command('url')
  .description('Webコンテンツを処理する')
  .argument('<url>', '解析対象のURL')
  .addOption(new Option('--depth <number>', '探索の深さ').default('3'))
  .addOption(new Option('--language <lang>', '翻訳言語').default('ja'))
  .addOption(new Option('--summary-only', '要約のみ実行'))
  .addOption(new Option('--translate-only', '翻訳のみ実行'))
  .addOption(new Option('--allow-domains <domains>', '許可ドメインの指定'))
  .addOption(new Option('--force-fetch', 'キャッシュを無視して再取得'))
  .action(async (url: string, options: { depth: string, language: string, summaryOnly: boolean, translateOnly: boolean, allowDomains: string, forceFetch: boolean }) => {
    try {
      const allowedDomains = options.allowDomains ? options.allowDomains.split(',') : [];
      const normalizedBaseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const sitemap: SitemapEntry[] = await crawlPage(normalizedBaseUrl, parseInt(options.depth), allowedDomains, 1, options.forceFetch);
      console.log(`saveSitemapToFile url: ${url}`);
      const sortedSitemap = sortByDirectory(sitemap, url);
      await saveSitemapToFile(sortedSitemap, url);
      console.log(JSON.stringify(sortedSitemap, null, 2));
      //console.log(`Crawled page: ${JSON.stringify(crawledPage, null, 2)}`);

      //const document = await downloadDocument(url);
      //const markdown = await htmlToMarkdown(document);
      //const translatedText = await translate(markdown, options.language);
      //console.log(`Translated: ${translatedText.substring(0, 100)}...`);
    } catch (error) {
      console.error(`Failed to process URL: ${error}`);
    }
  });

program.command('input')
  .description('ローカルファイルを処理する')
  .addOption(new Option('--language <lang>', '翻訳言語').default('ja'))
  .addOption(new Option('--summary-only', '要約のみ実行'))
  .addOption(new Option('--translate-only', '翻訳のみ実行'))
  .action((options: { language: string, summaryOnly: boolean, translateOnly: boolean }) => {
    console.log(`Input Options: ${JSON.stringify(options)}`);
  });

program.parse(process.argv);