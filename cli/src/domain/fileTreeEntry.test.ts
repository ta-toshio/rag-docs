import { describe, it, expect } from 'vitest';
import { factoryFileTreeEntry } from './fileTreeEntry';

describe('factoryFileTreeEntry', () => {
  it('should create a FileTreeEntry with correct properties', () => {
    const url = 'https://example.com/path/to/file';
    const name = 'file';
    const entry = factoryFileTreeEntry(url, name);

    expect(entry.id).toBeDefined();
    expect(entry.resource_id).toBe(url);
    expect(entry.domain).toBe('example.com');
    expect(entry.name).toBe(name);
    expect(entry.type).toBe('file');
    expect(entry.path).toBe('/path/to/file');
    expect(entry.parent).toBe('/path/to');
    expect(entry.timestamp).toBeDefined();
  });

  it('should set parent to null for root path', () => {
    const url = 'https://example.com/';
    const name = 'root';
    const entry = factoryFileTreeEntry(url, name);

    expect(entry.parent).toBeNull();
  });

  it('should set parent to null for root path', () => {
    const url = 'https://example.com';
    const name = 'root';
    const entry = factoryFileTreeEntry(url, name);

    expect(entry.parent).toBeNull();
  });
});
