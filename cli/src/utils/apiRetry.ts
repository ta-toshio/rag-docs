import { logger } from "../logger";

/**
 * Promise を返す関数を指定回数（exponential backoff付き）で再試行します。
 *
 * @param fn - 実行する非同期関数
 * @param retries - 再試行回数（初回実行含めた試行回数 - 1）
 * @param backoff - 初回の待機時間（ミリ秒）
 * @returns fn の実行結果
 * @throws 最終試行でも失敗した場合、最後のエラーを投げます
 */
async function apiRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  backoff: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (attempt === retries) {
        throw error;
      }
      logger.warn(`試行 ${attempt + 1} 回目が失敗しました。${backoff}ms 後に再試行します...`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2; // 待機時間を指数関数的に増加
    }
  }
  // ここに到達することは基本的にありませんが、型チェック用に
  throw new Error("再試行処理中に予期しないエラーが発生しました。");
}

export default apiRetry;
