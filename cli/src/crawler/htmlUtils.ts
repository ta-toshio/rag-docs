import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function fetchHTML(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    });

    if (response.status !== 200) {
      console.error(`HTMLの取得に失敗: ${url} (Status: ${response.status})`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`HTMLの取得中にエラーが発生: ${url}`, error);
    return null;
  }
}

function saveHTMLToFile(html: string, filepath: string): void {
  const outputPath = path.dirname(filepath);
  fs.mkdirSync(outputPath, { recursive: true });
  fs.writeFileSync(filepath, html);
}

export { fetchHTML, saveHTMLToFile };