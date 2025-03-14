#!/usr/bin/env node
import 'dotenv/config';
import { Command, Option } from 'commander';
import { logger } from './logger';
import { initializeDatabase } from './databaseConnection';
import { FileTreeRepository } from './repository/fileTreeRepository';
import { TranslationRepository } from './repository/translationRepository';
import { parseHtmlToDOM } from './parser/parser';
import { htmlToMarkdown } from './parser/markdownFormatter';
import { rateLimitedRequest } from './utils/rateLimiter';
import apiRetry from './utils/apiRetry';
import { translate } from './translator';
import { summarize } from './summarizer';
import { crawlPage } from './crawler/crawler';
import { SitemapEntry } from './domain/types';
import { saveSitemapToFile, saveMarkdownToFile, saveTranslationToFile, saveSummarizationToFile } from './fileWriter';
import { sortByDirectory } from './sorter';
import { readHtmlFiles } from './parser/parser';
import { getLanguageName, isValidLanguageCode } from './domain/language';
import { getFilePath, getHtmlFilePath, getMarkdownFilePath, getSummarizationFilePath, getTranslationFilePath } from './path';
import { readFile } from './fileReader';
import path from 'path';
import { factoryFileTreeEntry } from './domain/fileTreeEntry';
import { factoryTranslationEntry, TranslationEntry } from './domain/translationEntry';
import { v7 as uuidv7 } from 'uuid';

// Initialize database and handlers
const db = initializeDatabase();
const fileTreeHandler = new FileTreeRepository(db);
const translationHandler = new TranslationRepository(db);

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
  .action(async (url, options) => {
    try {
      if (!isValidLanguageCode(options.language)) {
        throw new Error(`Invalid language code: ${options.language}`);
      }
      const languageName = getLanguageName(options.language);

      const allowedDomains = options.allowDomains ? options.allowDomains.split(',') : [];
      const normalizedBaseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const sitemap: SitemapEntry[] = await crawlPage(
        normalizedBaseUrl,
        parseInt(options.depth),
        allowedDomains,
        1,
        options.forceFetch
      );
      logger.info(`saveSitemapToFile url: ${url}`);

      const sortedSitemap: SitemapEntry[] = sortByDirectory(sitemap, url);

      await saveSitemapToFile(sortedSitemap, url);
      // logger.info(JSON.stringify(sortedSitemap, null, 2));

      const promises = [];
      for (const [index, entry] of sortedSitemap.entries()) {

        const promies = new Promise(async (resolve, reject) => {

          logger.info(`entry.url: ${entry.url}`);
          // console.log(getFilePath(entry.url, 'html', 'html'));
          const htmlFilePath = getHtmlFilePath(entry.url);
          const htmlContent = await readFile(htmlFilePath);
          if (!htmlContent) {
            logger.error(`Failed to read HTML file: ${htmlFilePath}`);
            return reject();
          }

          const dom = parseHtmlToDOM(htmlContent);
          if (!dom) {
            logger.error(`Failed to parse HTML for ${entry.url}`);
            return reject();
          }

          const markdown = htmlToMarkdown(dom);

          const markdownFilePath = getMarkdownFilePath(entry.url);
          await saveMarkdownToFile(markdown, markdownFilePath);

          let summarization, translatation;

          if (options.summaryOnly) {
            try {
              summarization = await apiRetry(
                () => rateLimitedRequest(() => summarize(markdown, languageName))
              );
            } catch (error) {
              logger.error(`Summarization error: ${error}`);
              return reject();
            }
          }

          if (options.translateOnly) {
            try {
              translatation = await apiRetry(
                () => rateLimitedRequest(() => translate(markdown, languageName))
              );
            } catch (error) {
              logger.error(`Translation error: ${error}`);
              return reject();
            }
          }

          if (!options.summaryOnly && !options.translateOnly) {
            try {
              summarization = await apiRetry(
                () => rateLimitedRequest(() => summarize(markdown, languageName))
              );
            } catch (error) {
              logger.error(`Summarization error: ${error}`);
            }

            try {
              translatation = await apiRetry(
                () => rateLimitedRequest(() => translate(markdown, languageName))
              );
            } catch (error) {
              logger.error(`Translation error: ${error}`);
            }
          }

          const translationFilePath = getTranslationFilePath(entry.url);
          const summarizationFilePath = getSummarizationFilePath(entry.url);

          if (!translatation || !summarization) {
            return reject();
          }

          await Promise.all([
            saveTranslationToFile(translatation.translatedText, translationFilePath),
            saveSummarizationToFile(summarization.summary, summarizationFilePath)
          ]);

          // save fileTree entry
          const fileTreeEntry = factoryFileTreeEntry(entry.url, entry.title, index);
          fileTreeHandler.upsertFileTreeEntry(fileTreeEntry);

          // save tranlation entry
          const translationEntry: TranslationEntry = factoryTranslationEntry(
            entry.url,
            translatation,
            summarization,
            markdown,
            languageName
          )
          translationHandler.upsertTranslationEntry(translationEntry);

          return resolve(true);

        });

        promises.push(promies);
      };

      await Promise.all(promises);

      /*
      const htmlContents = await readHtmlFiles(url);
      // logger.log(`HTML Contents: ${htmlContents.length} files`);

      if (htmlContents.length <= 0) {
        logger.info('No HTML contents to process. url: ' + url);
        return;
      }

      for (const item of htmlContents) {
        let dom;
        try {
          dom = parseHtmlToDOM(item.htmlContent);
        } catch (error) {
          logger.error(`Failed to parse HTML for ${item.url}: ${error}`);
          continue;
        }

        const markdown = htmlToMarkdown(dom);
        // logger.info(`Markdown: ${markdown.substring(0, 100)}...`);
        // logger.info(`item.path: ${item.path}`);
        await saveMarkdownToFile(markdown, item.url);
        // logger.log(`DOM: Parsed successfully`);

        let summarization, translatation;

        if (options.summaryOnly) {
          try {
            summarization = await apiRetry(
              () => rateLimitedRequest(() => summarize(markdown, languageName))
            );
            // logger.log(`Summarized: ${summarizedText.summary.substring(0, 100)}...`);
          } catch (error) {
            logger.error(`Summarization error: ${error}`);
          }
        }

        if (options.translateOnly) {
          try {
            translatation = await apiRetry(
              () => rateLimitedRequest(() => translate(markdown, languageName))
            );
            // logger.log(`Translated: ${translatation.translatedText.substring(0, 100)}...`);
          } catch (error) {
            logger.error(`Translation error: ${error}`);
          }
        }

        if (!options.summaryOnly && !options.translateOnly) {
          try {
            summarization = await apiRetry(
              () => rateLimitedRequest(() => summarize(markdown, languageName))
            );
            // logger.log(`Summarized: ${summarizedText.summary.substring(0, 100)}...`);
          } catch (error) {
            logger.error(`Summarization error: ${error}`);
          }
          try {
            translatation = await apiRetry(
              () => rateLimitedRequest(() => translate(markdown, languageName))
            );
            // logger.log(`Translated: ${translatation.translatedText.substring(0, 100)}...`);
          } catch (error) {
            logger.error(`Translation error: ${error}`);
          }
        }
        if (translatation?.translatedText) {
          await saveTranslationToFile(translatation.translatedText, item.url);
        }

        if (summarization?.summary) {
          await saveSummarizationToFile(summarization.summary, item.url);
        }
      }
      */


    } catch (error) {
      logger.error(`Failed to process URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

program.command('input')
  .description('ローカルファイルを処理する')
  .addOption(new Option('--language <lang>', '翻訳言語').default('ja'))
  .addOption(new Option('--summary-only', '要約のみ実行'))
  .addOption(new Option('--translate-only', '翻訳のみ実行'))
  .action((options) => {
    logger.info(`Input Options: ${JSON.stringify(options)}`);
  });

program.parse(process.argv);
