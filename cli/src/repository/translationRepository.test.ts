import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { TranslationRepository } from './translationRepository';
import { TranslationEntry } from '../domain/translationEntry';
import { v7 as uuidv7 } from 'uuid';

describe('TranslationRepository', () => {
  let db: Database.Database;
  let repository: TranslationRepository;

  beforeEach(() => {
    db = new Database(':memory:'); // インメモリデータベースを使用
    repository = new TranslationRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should register a translation entry and retrieve it by resource_id', () => {
    const mockEntry: TranslationEntry = {
      id: uuidv7(),
      resource_id: 'https://example.com/docs/test',
      title: 'Test Document',
      summary: 'This is a test document.',
      description: null,
      text: 'This is the translated text.',
      original_text: 'This is the original text.',
      language: 'en',
      keywords: null,
      timestamp: new Date().toISOString(),
    };

    repository.upsertTranslationEntry(mockEntry);

    const retrievedEntry = repository.getTranslationEntryByResourceId(mockEntry.resource_id);
    expect(retrievedEntry).toEqual(mockEntry);
  });

  it('should return null when retrieving a non-existent resource_id', () => {
    const retrievedEntry = repository.getTranslationEntryByResourceId('non-existent-resource_id');
    expect(retrievedEntry).toBeNull();
  });

  it('should register a translation entry and retrieve it by id', () => {
    const mockEntry: TranslationEntry = {
      id: uuidv7(),
      resource_id: 'https://example.com/docs/test2',
      title: 'Test Document 2',
      summary: 'This is a test document 2.',
      description: null,
      text: 'This is the translated text 2.',
      original_text: 'This is the original text 2.',
      language: 'en',
      keywords: null,
      timestamp: new Date().toISOString(),
    };

    repository.upsertTranslationEntry(mockEntry);

    const retrievedEntry = repository.getTranslationEntryById(mockEntry.id);
    expect(retrievedEntry).toEqual(mockEntry);
  });

  it('should return null when retrieving a non-existent id', () => {
    const retrievedEntry = repository.getTranslationEntryById('non-existent-id');
    expect(retrievedEntry).toBeNull();
  });
});