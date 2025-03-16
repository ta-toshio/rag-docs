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
      CREATE TABLE IF NOT EXISTS file_trees (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        domain TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('file', 'folder')) NOT NULL,
        path TEXT NOT NULL,
        parent TEXT,
        timestamp TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE (project_id, resource_id) -- 複合ユニーク制約を追加
      )
    `);
  }

  public registerFileTreeEntry(entry: FileTreeEntry): void {
    const stmt = this.db.prepare(`
      INSERT INTO file_trees (
        id,
        project_id,
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
        @project_id,
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
    const existingEntry = this.getFileTreeEntryUniqueKey(entry.project_id, entry.resource_id);

    try {
      if (existingEntry) {
        const stmt = this.db.prepare(`
          UPDATE file_trees SET
            resource_id = @resource_id,
            domain = @domain,
            name = @name,
            type = @type,
            path = @path,
            parent = @parent,
            timestamp = @timestamp,
            sort_order = @sort_order,
            project_id = @project_id
          WHERE resource_id = @resource_id
        `);
        stmt.run(entry);
        logger.info(`Updated file tree entry with resource_id: ${entry.resource_id}`);
      } else {
        const stmt = this.db.prepare(`
          INSERT INTO file_trees (
            id,
            resource_id,
            domain,
            name,
            type,
            path,
            parent,
            timestamp,
            sort_order,
            project_id
          ) VALUES (
            @id,
            @resource_id,
            @domain,
            @name,
            @type,
            @path,
            @parent,
            @timestamp,
            @sort_order,
            @project_id
          )
        `);
        stmt.run(entry);
        logger.info(`Inserted new file tree entry with resource_id: ${entry.resource_id}`);
      }
    } catch (error) {
      logger.error(`Error upserting file tree entry: ${error}`);
    }
  }

  private getFileTreeEntryUniqueKey(project_id: string, resource_id: string): FileTreeEntry | null {
    const stmt = this.db.prepare('SELECT * FROM file_trees WHERE project_id = ? and resource_id = ?');
    const result = stmt.get(project_id, resource_id);
    return result ? result as FileTreeEntry : null;
  }

  public getFileTreeEntryById(id: string): FileTreeEntry | null {
    const stmt = this.db.prepare('SELECT * FROM file_trees WHERE id = ?');
    const result = stmt.get(id);
    return result ? result as FileTreeEntry : null;
  }
}
