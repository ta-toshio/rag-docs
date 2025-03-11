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

export { saveSitemapToFile };