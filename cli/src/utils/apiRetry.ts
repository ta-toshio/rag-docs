async function apiRetry<T>(fn: () => Promise<T>, retries = 3, backoff = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying after ${backoff}ms`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return apiRetry(fn, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export default apiRetry;