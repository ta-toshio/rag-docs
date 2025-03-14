import { Database } from 'better-sqlite3';
import { FileTreeEntry } from '../domain/fileTreeEntry';
import { logger } from '../logger'; // Add logger import

export class FileTreeRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.initializeTable();
  }

  private initializeTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_tree (
        id TEXT PRIMARY KEY,
        resource_id TEXT NOT NULL UNIQUE,
        domain TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('file', 'folder')) NOT NULL,
        path TEXT NOT NULL,
        parent TEXT,
        timestamp TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `);
  }

  public registerFileTreeEntry(entry: FileTreeEntry): void {
    const stmt = this.db.prepare(`
      INSERT INTO file_tree (
        id,
        resource_id,
        domain,
        name,
        type,
        path,
        parent,
        timestamp,
        sort_order
      ) VALUES (
        @id,
        @resource_id,
        @domain,
        @name,
        @type,
        @path,
        @parent,
        @timestamp,
        @sort_order
      )
    `);

    stmt.run(entry);
  }

  public upsertFileTreeEntry(entry: FileTreeEntry): void {
    const existingEntry = this.getFileTreeEntryByResourceId(entry.resource_id);

    if (existingEntry) {
      const stmt = this.db.prepare(`
        UPDATE file_tree SET
          resource_id = @resource_id,
          domain = @domain,
          name = @name,
          type = @type,
          path = @path,
          parent = @parent,
          timestamp = @timestamp,
          sort_order = @sort_order
        WHERE resource_id = @resource_id
      `);
      stmt.run(entry);
      logger.info(`Updated file tree entry with resource_id: ${entry.resource_id}`);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO file_tree (
          id,
          resource_id,
          domain,
          name,
          type,
          path,
          parent,
          timestamp,
          sort_order
        ) VALUES (
          @id,
          @resource_id,
          @domain,
          @name,
          @type,
          @path,
          @parent,
          @timestamp,
          @sort_order
        )
      `);
      stmt.run(entry);
      logger.info(`Inserted new file tree entry with resource_id: ${entry.resource_id}`);
    }
  }

  private getFileTreeEntryByResourceId(resource_id: string): FileTreeEntry | null {
    const stmt = this.db.prepare('SELECT * FROM file_tree WHERE resource_id = ?');
    const result = stmt.get(resource_id);
    return result ? result as FileTreeEntry : null;
  }

  public getFileTreeEntryById(id: string): FileTreeEntry | null {
    const stmt = this.db.prepare('SELECT * FROM file_tree WHERE id = ?');
    const result = stmt.get(id);
    return result ? result as FileTreeEntry : null;
  }
}
