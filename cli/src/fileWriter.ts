import fs from 'fs';
import path from 'path';

async function saveSitemapToFile(sitemap: any[], url: string): Promise<void> {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const outputPath = path.join('output', domain);
    const filepath = path.join(outputPath, 'sitemap.json');

    console.log(`outputPath: ${outputPath}`);

    fs.mkdirSync(outputPath, { recursive: true });
    try {
      fs.writeFileSync(filepath, JSON.stringify(sitemap, null, 2));
    } catch (e) {
      console.error(`writeFileSync error: ${e}`);
    }

    console.log(`filepath: ${filepath}`);

    console.log(`サイトマップを保存: ${filepath}`);
  } catch (error) {
    console.error(`サイトマップの保存中にエラーが発生:`, error);
  }
}

async function saveMarkdownToFile(markdown: string, url: string): Promise<void> {
  try {
    const domain = path.dirname(url).split('/')[1]; // ドメイン名を取得
    const outputPath = path.join('output', domain, 'markdown', path.basename(path.dirname(url)));
    const filename = path.basename(url).replace('.html', '');
    const filepath = path.join(outputPath, `${filename}.md`);

    fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(filepath, markdown, 'utf-8');

    console.log(`Markdown ファイルを保存: ${filepath}`);
  } catch (error) {
    console.error(`Markdown ファイルの保存中にエラーが発生:`, error);
  }
}

export { saveSitemapToFile, saveMarkdownToFile };