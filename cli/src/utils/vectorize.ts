import { logger } from "../logger";
import { embeddingModel } from "../genAIClient";

export const getEmbedding = async (text: string) => {
  try {
    // const result = await apiRetry(
    //   () => rateLimitedRequest(() => embeddingModel.embedContent(text))
    // );
    const result = await embeddingModel.embedContent(text)
    return result.embedding.values;
  } catch (error) {
    logger.error(`Failed to generate embedding for text: ${text}: ${error}`);
    throw error;
  }
};