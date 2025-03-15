import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorHandler } from './vectorHandler';
import { VectorEntry } from '../domain/vectorEntry';
import { v4 as uuidv4 } from 'uuid';
import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';

// Qdrant への接続設定
const qdrantClient = new QdrantClient({
  url: 'http://localhost:6333', // Qdrant の URL
});

const collectionName = 'test_collection';

describe('VectorHandler', () => {
  let handler: VectorHandler;

  beforeAll(async () => {
    const response = await qdrantClient.getCollections();
    if (response.collections.some(collection => collection.name === collectionName)) {
      await qdrantClient.deleteCollection(collectionName);
    }
    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: 3, // テスト用に3次元のベクトル
        distance: 'Cosine',
      },
    });
  });

  beforeEach(() => {
    handler = new VectorHandler(qdrantClient, collectionName);
  });

  afterAll(async () => {
    // テスト終了後、コレクションを削除（必要に応じて）
    await qdrantClient.deleteCollection(collectionName);
  });

  it('should insert a vector into Qdrant using upsertVector', async () => {
    const mockEntry: VectorEntry = {
      id: uuidv4(),
      resource_id: 'https://example.com/docs/test',
      paragraph_index: 1,
      vector: [0.1, 0.2, 0.3],
      original_text: 'This is a test paragraph.',
      language: 'en',
      timestamp: new Date().toISOString(),
    };

    await handler.upsertVector(mockEntry);

    // Qdrant からデータを検索して、登録されたデータが正しいことを確認
    const searchResult = await qdrantClient.search(collectionName, {
      vector: mockEntry.vector,
      limit: 1,
    });

    expect(searchResult[0].id).toBe(mockEntry.id);
  });

  it('should batch insert vectors using upsertVectors', async () => {
    const numEntries = 60; // バッチサイズ50を超える件数
    const entries: VectorEntry[] = [];
    for (let i = 0; i < numEntries; i++) {
      const entry: VectorEntry = {
        id: uuidv4(),
        resource_id: 'https://example.com/docs/test-batch',
        paragraph_index: i,
        vector: [0.1, 0.2, 0.3], // ダミーのベクトル
        original_text: `Paragraph ${i}`,
        language: 'en',
        timestamp: new Date().toISOString(),
      };
      entries.push(entry);
    }

    await handler.upsertVectors(entries);

    // 同一ベクトルで検索し、バッチで登録したエントリがすべて存在するか確認
    const searchResults = await qdrantClient.search(collectionName, {
      vector: [0.1, 0.2, 0.3],
      limit: numEntries + 10, // 余裕を持ったlimit
    });

    const returnedIds = searchResults.map(result => result.id);
    for (const entry of entries) {
      expect(returnedIds).toContain(entry.id);
    }
  });

});
