import Bottleneck from "bottleneck";

/**
 * APIリクエストをレートリミット付きで実行
 * @see .roo/docs/rateLimit.md
 */

// 1分間に15回の制限 = 4秒（4000ms）間隔
const limiter = new Bottleneck({
  minTime: 4000,  // 4000ms（4秒）ごとに1リクエスト
  maxConcurrent: 1, // 同時実行は1件のみ
});

/**
 * APIリクエストをレートリミット付きで実行
 * @param fn APIリクエスト関数（非同期）
 * @param args 関数に渡す引数
 */
export async function rateLimitedRequest<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
  return limiter.schedule(() => fn(...args));
}