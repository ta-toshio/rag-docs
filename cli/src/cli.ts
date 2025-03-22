#!/usr/bin/env node
import 'dotenv/config';
import { Command, Option } from 'commander';
import { logger } from './logger';
import { ProjectRepository } from './repository/projectRepository';
import { initializeDatabase } from './databaseConnection';
import { FileTreeRepository } from './repository/fileTreeRepository';
import { TranslationRepository } from './repository/translationRepository';
import { parseHtmlToDOM } from './parser/parser';
import { VectorHandler } from './qdrant/vectorHandler';
import { htmlToMarkdown } from './parser/markdownFormatter';
import { rateLimitedRequest } from './utils/rateLimiter';
import apiRetry from './utils/apiRetry';
import { translate } from './translator';
import { summarize } from './summarizer';
import { crawlPage } from './crawler/crawler';
import { SitemapEntry } from './domain/types';
import { saveSitemapToFile, saveMarkdownToFile, saveTranslationToFile, saveSummarizationToFile } from './fileWriter';
import { sortByDirectory } from './sorter';
import { getLanguageName, isValidLanguageCode } from './domain/language';
import { getHtmlFilePath, getMarkdownFilePath, getSummarizationFilePath, getTranslationFilePath } from './path';
import { readFile } from './fileReader';
import { factoryFileTreeEntry } from './domain/fileTreeEntry';
import { factoryTranslationEntry, TranslationEntry } from './domain/translationEntry';
import { QdrantClient } from '@qdrant/js-client-rest';
import { factoryVectorEntry } from './domain/vectorEntry';
import { splitMarkdownToParagraphs } from './utils/paragraphSplit';
import { QDRANT_COLLECTION_NAME, QDRANT_URL } from './config';
import { getEmbedding } from './utils/vectorize';
import { factoryProjectEntry } from './domain/projectEntry';
import { ChatSessionRepository } from './repository/chatSessionRepository';
import { normalizeUrl } from './crawler/urlUtils';

// Initialize database and handlers
const db = initializeDatabase();
const fileTreeHandler = new FileTreeRepository(db);
const translationHandler = new TranslationRepository(db);
const projectRepository = new ProjectRepository(db);
new ChatSessionRepository(db);

// Initialize Qdrant client and handler
const qdrantClient = new QdrantClient({
  url: QDRANT_URL,
});
const vectorHandler = new VectorHandler(qdrantClient, QDRANT_COLLECTION_NAME);

const program = new Command();

program
  .name('translate-docs')
  .description('Webドキュメント翻訳・要約・検索システム')
  .version('1.0.0');

program.command('url')
  .description('Webコンテンツを処理する')
  .argument('<url>', '解析対象のURL')
  .addOption(new Option('--depth <number>', '探索の深さ').default('2'))
  .addOption(new Option('--language <lang>', '翻訳言語').default('ja'))
  .addOption(new Option('--summary-only', '要約のみ実行'))
  .addOption(new Option('--translate-only', '翻訳のみ実行'))
  .addOption(new Option('--allow-domains <domains>', '許可ドメインの指定'))
  .addOption(new Option('--force-fetch', 'キャッシュを無視して再取得'))
  .action(async (dirtyUrl: string, options: any) => {
    try {

      if (!isValidLanguageCode(options.language)) {
        throw new Error(`Invalid language code: ${options.language}`);
      }
      const languageName = getLanguageName(options.language);

      const allowedDomains = options.allowDomains ? options.allowDomains.split(',') : [];
      const url = normalizeUrl(dirtyUrl);
      const sitemap: SitemapEntry[] = await crawlPage(
        url,
        parseInt(options.depth),
        allowedDomains,
        1,
        options.forceFetch
      );
      logger.info(`saveSitemapToFile url: ${url}`);

      const sortedSitemap: SitemapEntry[] = sortByDirectory(sitemap, url);

      saveSitemapToFile(sortedSitemap, url);
      // logger.info(JSON.stringify(sortedSitemap, null, 2));

      let project = projectRepository.getProjectByValue(url);

      if (!project) {
        projectRepository.createProject(factoryProjectEntry(url));
        project = projectRepository.getProjectByValue(url);
      }

      if (!project) {
        logger.error(`Failed to create project with value: ${url}`);
        throw new Error(`Failed to create project with value: ${url}`);
      }

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
          saveMarkdownToFile(markdown, markdownFilePath);

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
          logger.info(`Saved translation and summarization files for ${entry.url}`);

          // save fileTree entry
          const fileTreeEntry = factoryFileTreeEntry(entry.url, entry.title, index, project.id);
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

          // save vector data
          try {
            // Markdown を段落ごとに分割（各段落200〜500文字）
            const paragraphs = splitMarkdownToParagraphs(markdown); // 本当はtranslatation.translatedText
            const vectorEntries = await Promise.all(
              paragraphs.map(async (para, paraIndex) => {
                const vector = await getEmbedding(para);
                return factoryVectorEntry(entry.url, project.id, paraIndex, vector, para, languageName);
              })
            );
            // const vectorEntries = paragraphs.map((para, paraIndex) => {
            //   // 実際の実装では、Google Gemini API 等で埋め込みベクトルを取得する
            //   // ここではデモ用に768次元のダミーベクトル（全要素0）を使用
            //   const dummyVector = new Array(768).fill(0);
            //   return factoryVectorEntry(entry.url, paraIndex, dummyVector, para, languageName);
            // });
            // バッチ処理で Qdrant に登録
            await vectorHandler.deleteVectorsByResourceIds([entry.url], project.id);
            await vectorHandler.upsertVectors(vectorEntries);
          } catch (e) {
            logger.error(`Failed to upsert vector entries: ${e}`);
          }

          return resolve(true);

        });

        promises.push(promies);
      };

      await Promise.all(promises);

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
