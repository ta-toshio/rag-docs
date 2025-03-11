import TurndownService from 'turndown';
import { CheerioAPI } from 'cheerio';
import { gfm } from 'turndown-plugin-gfm';

/**
 * HTML を GitHub Flavored Markdown (GFM) に変換します。
 *
 * @param {CheerioAPI} dom - 変換対象の HTML を含む Cheerio の DOM オブジェクト
 * @returns {string} - 変換後の Markdown 文字列
 */
export function htmlToMarkdown(dom: CheerioAPI): string {
  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      bulletListMarker: '-', // 箇条書きのマーカーを '-' に設定
    });
    
    // GitHub Flavored Markdown プラグインの適用
    turndownService.use(gfm);
    
    // 画像タグ (<img>) の処理：title 属性がある場合も含める
    turndownService.addRule('image', {
      filter: 'img',
      replacement: (content, node) => {
        const src = node.getAttribute('src');
        const alt = node.getAttribute('alt') || '';
        const title = node.getAttribute('title');
        if (!src) return '';
        return title
          ? `![${alt}](${src} "${title}")`
          : `![${alt}](${src})`;
      }
    });
    
    // リンクタグ (<a>) の処理：title 属性が空の場合は省略
    turndownService.addRule('link', {
      filter: 'a',
      replacement: (content, node) => {
        const href = node.getAttribute('href');
        const title = node.getAttribute('title');
        if (!href) return content;
        return title
          ? `[${content}](${href} "${title}")`
          : `[${content}](${href})`;
      }
    });
    
    // 打ち消し線（strikethrough）の処理を上書き
    turndownService.addRule('del', {
      filter: ['del', 's', 'strike'],
      replacement: (content, node) => {
        return `~~${content}~~`;
      }
    });
    
    // DOM 内に <body> タグがあればその中身を使用、なければ全体を使用する
    const htmlContent = dom('body').html() || dom.html() || '';
    let markdown = turndownService.turndown(htmlContent);
    
    // Markdown のフォーマットを統一する処理
    markdown = formatMarkdown(markdown);
    
    return markdown;
  } catch (error) {
    console.error(`Error converting HTML to Markdown: ${error}`);
    return "";
  }
}

/**
 * Markdown のフォーマットを統一します。
 *
 * @param {string} markdown - 整形対象の Markdown 文字列
 * @returns {string} - 整形後の Markdown 文字列
 */
function formatMarkdown(markdown: string): string {
  // ① 番号付きリスト: 番号とテキストの間の余分なスペースを1つに統一
  markdown = markdown.replace(/^(\d+\.)\s+/gm, '$1 ');

  // ② 箇条書きリスト: ハイフンとテキストの間の余分なスペースを1つに統一
  markdown = markdown.replace(/^(\s*-)\s+/gm, '$1 ');

  // ③ タスクリスト: チェックボックス部分 ([x] または [ ]) の後の余分なスペースを1つに統一
  markdown = markdown.replace(/^(\s*-\s*\[[ xX]\])\s+/gm, '$1 ');

  // ④ 全体の不要な空白・改行の削除
  return markdown.trim();
}
