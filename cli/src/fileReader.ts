
import fs from 'fs';

export async function readFile(url: string) {
  try {
    return fs.readFileSync(url, 'utf-8');
  } catch (error) {
    console.error(`Error reading HTML files from sitemap: ${error}`);
    return null;
  }
}
  