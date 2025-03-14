import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { FileTreeRepository } from './fileTreeRepository';
import { FileTreeEntry } from '../domain/fileTreeEntry';

describe('FileTreeHandler', () => {
  let db: Database.Database;
  let handler: FileTreeRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    handler = new FileTreeRepository(db);
  });

  it('should register and retrieve a file entry', () => {
    const entry: FileTreeEntry = {
      id: 'file1',
      resource_id: 'res1',
      domain: 'example.com',
      name: 'test.txt',
      type: 'file',
      path: '/path/to/file',
      parent: null,
      sort_order: 0,
      timestamp: new Date().toISOString()
    };

    handler.registerFileTreeEntry(entry);
    const result = handler.getFileTreeEntryById('file1');

    expect(result).toEqual(entry);
  });

  it('should return null for non-existent entry', () => {
    const result = handler.getFileTreeEntryById('nonexistent');
    expect(result).toBeNull();
  });

  it('should insert new entry on upsert when not exists', () => {
    const entry: FileTreeEntry = {
      id: 'file2',
      resource_id: 'res2',
      domain: 'example.com',
      name: 'test2.txt',
      type: 'file',
      path: '/path/to/file2',
      parent: null,
      sort_order: 0,
      timestamp: new Date().toISOString()
    };

    handler.upsertFileTreeEntry(entry);
    const result = handler.getFileTreeEntryById('file2');
    expect(result).toEqual(entry);
  });

  it('should update existing entry on upsert when exists', () => {
    const initialEntry: FileTreeEntry = {
      id: 'file3',
      resource_id: 'res3',
      domain: 'example.com',
      name: 'test3.txt',
      type: 'file',
      path: '/path/to/file3',
      parent: null,
      sort_order: 0,
      timestamp: new Date().toISOString()
    };

    const updatedEntry: FileTreeEntry = {
      ...initialEntry,
      name: 'updated.txt',
      path: '/new/path/to/file3'
    };

    handler.registerFileTreeEntry(initialEntry);
    handler.upsertFileTreeEntry(updatedEntry);
    const result = handler.getFileTreeEntryById('file3');
    expect(result).toEqual(updatedEntry);
  });
});
