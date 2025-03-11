import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from './markdownFormatter'; 
import * as cheerio from 'cheerio';

describe('htmlToMarkdown', () => {
  // 1. ヘッダーの変換テスト: <h1> を atx スタイルに変換するか
  it('should convert header tags to atx style', () => {
    const html = '<h1>Title</h1>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('# Title');
  });

  // 2. 段落の変換テスト
  it('should convert paragraph tags correctly', () => {
    const html = '<p>This is a paragraph.</p>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('This is a paragraph.');
  });

  // 3. 画像タグの変換テスト: title 属性あり
  it('should convert image tags with title to Markdown image syntax', () => {
    const html = '<img src="image.png" alt="alt text" title="Image Title">';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('![alt text](image.png "Image Title")');
  });

  // 4. 画像タグの変換テスト: title 属性なし
  it('should convert image tags without title correctly', () => {
    const html = '<img src="image.png" alt="alt text">';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('![alt text](image.png)');
  });

  // 5. リンクタグの変換テスト: title 属性あり
  it('should convert link tags with title to Markdown link syntax', () => {
    const html = '<a href="https://example.com" title="Example">Example</a>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('[Example](https://example.com "Example")');
  });

  // 6. リンクタグの変換テスト: title 属性なし
  it('should convert link tags without title correctly', () => {
    const html = '<a href="https://example.com">Example</a>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('[Example](https://example.com)');
  });

  // 7. テーブルの変換テスト
  it('should convert table tags to Markdown table syntax', () => {
    const html = `
      <table>
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Row1 Col1</td>
            <td>Row1 Col2</td>
          </tr>
        </tbody>
      </table>
    `;
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('| Header 1 | Header 2 |');
    expect(markdown).toContain('| Row1 Col1 | Row1 Col2 |');
  });

  // 8. 箇条書きリスト（ul）の変換テスト
  it('should convert unordered lists correctly', () => {
    const html = `
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    `;
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('- Item 1');
    expect(markdown).toContain('- Item 2');
  });

  // 9. 番号付きリスト（ol）の変換テスト
  it('should convert ordered lists correctly', () => {
    const html = `
      <ol>
        <li>First</li>
        <li>Second</li>
      </ol>
    `;
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('1. First');
    expect(markdown).toContain('2. Second');
  });

  // 10. ブロック引用（blockquote）の変換テスト
  it('should convert blockquote tags to Markdown blockquote syntax', () => {
    const html = '<blockquote>This is a blockquote.</blockquote>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('> This is a blockquote.');
  });

  // 11. コードブロックの変換テスト (pre/code を fenced code block に)
  it('should convert pre/code blocks to fenced code blocks', () => {
    const html = `<pre><code class="language-js">console.log("Hello");</code></pre>`;
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('```');
    expect(markdown).toContain('console.log("Hello");');
  });

  // 12. インラインコードの変換テスト
  it('should convert inline code tags to backticks', () => {
    const html = '<p>This is <code>inline code</code> example.</p>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('`inline code`');
  });

  // 13. 打ち消し線（strikethrough）の変換テスト
  it('should convert strikethrough tags to Markdown strikethrough syntax', () => {
    const html = '<p><del>Deleted text</del></p>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('~~Deleted text~~');
  });

  // 14. ネストした HTML 要素の変換テスト
  it('should correctly handle nested HTML elements', () => {
    const html = `
      <ul>
        <li>
          <p>Nested paragraph in list</p>
          <ul>
            <li>Inner item</li>
          </ul>
        </li>
      </ul>
    `;
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    // ネストしたリストの場合、インデントなどで表現されることを想定
    expect(markdown).toContain('- Nested paragraph in list');
    expect(markdown).toContain('  - Inner item');
  });

  // 15. 複数段落の変換テスト
  it('should maintain separation between multiple paragraphs', () => {
    const html = '<p>First paragraph.</p><p>Second paragraph.</p>';
    const dom = cheerio.load(html);
    const markdown = htmlToMarkdown(dom);
    expect(markdown).toContain('First paragraph.');
    expect(markdown).toContain('Second paragraph.');
    // 段落間に適切な改行があることを期待
  });

});