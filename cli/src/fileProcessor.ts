// ローカルファイルの処理

import axios from 'axios';

export async function downloadDocument(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to download document from ${url}: ${error}`);
    throw error;
  }
}