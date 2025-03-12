#!/usr/bin/env node

import 'dotenv/config';
import { Command, Option } from 'commander';
import { downloadDocument } from './fileProcessor';
import { parseHtmlToDOM } from './parser/parser';
import { htmlToMarkdown } from './parser/markdownFormatter';
import { rateLimitedRequest } from './utils/rateLimiter';
import apiRetry from './utils/apiRetry';
import { translate } from './translator';
import { summarize } from './summarizer';
import { crawlPage, getHTML } from './crawler/crawler';
import { SitemapEntry } from './types';
import { saveSitemapToFile, saveMarkdownToFile, saveTranslationToFile, saveSumarizationToFile } from './fileWriter';
import { sortByDirectory } from './sorter';
import { getHtmlFilePathsFromSitemap, readHtmlFiles } from './parser/parser';
import { LanguageName, getLanguageName, LanguageCode, isValidLanguageCode } from './types/language';

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
      if (!isValidLanguageCode(options.language)) {
        throw new Error(`Invalid language code: ${options.language}`);
      }
      const languageName = getLanguageName(options.language);

      const allowedDomains = options.allowDomains ? options.allowDomains.split(',') : [];
      const normalizedBaseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const sitemap: SitemapEntry[] = await crawlPage(normalizedBaseUrl, parseInt(options.depth), allowedDomains, 1, options.forceFetch);
      console.log(`saveSitemapToFile url: ${url}`);
      const sortedSitemap = sortByDirectory(sitemap, url);
      await saveSitemapToFile(sortedSitemap, url);
      // console.log(JSON.stringify(sortedSitemap, null, 2));

      const htmlContents = await readHtmlFiles(url);
      // console.log(`HTML Contents: ${htmlContents.length} files`);

      if (htmlContents.length <= 0) {
        console.log('No HTML contents to process.');
        return;
      }

      for (const item of htmlContents) {
        const dom = parseHtmlToDOM(item.htmlContent);
        if (!dom) {
          console.log(`DOM: Failed to parse`);
          continue;
        }

        const markdown = htmlToMarkdown(dom);
        // console.log(`Markdown: ${markdown.substring(0, 100)}...`);
        console.log(`item.path: ${item.path}`);
        await saveMarkdownToFile(markdown, item.url);
        // console.log(`DOM: Parsed successfully`);

        let summarization, translatation;

        if (options.summaryOnly) {
          summarization = await apiRetry(() => rateLimitedRequest(() => summarize(markdown, languageName)));
          // console.log(`Summarized: ${summarizedText.summary.substring(0, 100)}...`);
        }

        if (options.translateOnly) {
          translatation = await apiRetry(() => rateLimitedRequest(() => translate(markdown, languageName)));
          // console.log(`Translated: ${translatation.translatedText.substring(0, 100)}...`);
        }

        if (!options.summaryOnly && !options.translateOnly) {
          console.log("Both summary and translation are enabled.");
          summarization = await apiRetry(() => rateLimitedRequest(() => summarize(markdown, languageName)));
          // console.log(`Summarized: ${summarizedText.summary.substring(0, 100)}...`);
          translatation = await apiRetry(() => rateLimitedRequest(() => translate(markdown, languageName)));
          // console.log(`Translated: ${translatation.translatedText.substring(0, 100)}...`);
        }
        if (translatation?.translatedText) {
          await saveTranslationToFile(translatation.translatedText, item.url);
        }

        if (summarization?.summary) {
          await saveSumarizationToFile(summarization.summary, item.url);
        }
      }
    } catch (error) {
      console.error(`Failed to process URL: ${error instanceof Error ? error.message : String(error)}`);
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