import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorEntry } from '../domain/vectorEntry';
import { logger } from '../logger';
import { validate as isUUID } from 'uuid';

export class VectorHandler {
  private client: QdrantClient;
  private collectionName: string;

  constructor(client: QdrantClient, collectionName: string) {
    this.client = client;
    this.collectionName = collectionName;

    this.initializeTable();
  }

  async initializeTable(): Promise<void> {
    try {
      // 既存コレクションの一覧を取得し、collectionName と一致するものがあるかチェック
      const collectionsResponse = await this.client.getCollections();
      const collections = collectionsResponse.collections;
      const exists = collections.some(c => c.name === this.collectionName);
      if (exists) {
        logger.info(`Collection ${this.collectionName} already exists. Skipping creation.`);
        return;
      }
      // 存在しない場合は、新たにコレクションを作成（768次元、Cosine距離を指定）
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 768,
          distance: "Cosine"
        }
      });
      logger.info(`Created collection ${this.collectionName}`);
    } catch (error) {
      logger.error(`Failed to initialize collection ${this.collectionName}: ${error}`);
      throw error;
    }
  }

  private isValidId(id: string): boolean {
    return /^[0-9]+$/.test(id) || isUUID(id);
  }

  async upsertVector(entry: VectorEntry): Promise<void> {
    if (!this.isValidId(entry.id)) {
      throw new Error(`Invalid point ID: ${entry.id}. Must be an unsigned integer or a UUID.`);
    }
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: entry.id,
            vector: entry.vector,
            payload: {
              project_id: entry.project_id,
              resource_id: entry.resource_id,
              paragraph_index: entry.paragraph_index,
              original_text: entry.original_text,
              language: entry.language,
              timestamp: entry.timestamp,
            },
          },
        ],
      });
      logger.info(`Inserted vector with id: ${entry.id} into collection: ${this.collectionName}`);
    } catch (error) {
      logger.error(`Failed to insert vector with id: ${entry.id} into collection: ${this.collectionName}: ${error}`);
      throw error;
    }
  }

  // バッチ処理でベクトルを登録（デフォルトは50件単位）
  async upsertVectors(entries: VectorEntry[], batchSize: number = 50): Promise<void> {
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const points = batch.map(entry => {
        if (!this.isValidId(entry.id)) {
          throw new Error(`Invalid point ID: ${entry.id}. Must be an unsigned integer or a UUID.`);
        }
        return {
          id: entry.id,
          vector: entry.vector,
          payload: {
            resource_id: entry.resource_id,
            paragraph_index: entry.paragraph_index,
            original_text: entry.original_text,
            language: entry.language,
            timestamp: entry.timestamp,
          },
        };
      });

      try {
        await this.client.upsert(this.collectionName, {
          wait: true,
          points,
        });
        logger.info(`Upserted batch of ${points.length} vectors into collection: ${this.collectionName}`);
      } catch (error) {
        logger.error(`Failed to upsert batch: ${error}`);
        console.log(error)
        throw error;
      }
    }
  }

  /**
 * 指定された resource_id の配列に該当するベクトルデータをバッチ削除する
 * @param resourceIds 削除対象の resource_id の配列
 */
  async deleteVectorsByResourceIds(resourceIds: string[]): Promise<void> {
    if (resourceIds.length === 0) {
      logger.info('No resource_ids provided for deletion.');
      return;
    }

    // Qdrant のフィルター条件として、各 resource_id に対する match を should 条件で指定
    const filter = {
      should: resourceIds.map(resource_id => ({
        key: "resource_id",
        match: { value: resource_id }
      }))
    };

    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        filter,
      });
      logger.info(`Deleted vectors with resource_ids: ${resourceIds.join(", ")} from collection: ${this.collectionName}`);
    } catch (error) {
      logger.error(`Failed to delete vectors with resource_ids: ${resourceIds.join(", ")}: ${error}`);
      throw error;
    }
  }
}
