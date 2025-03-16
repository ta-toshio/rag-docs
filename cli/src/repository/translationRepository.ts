import { Database } from 'better-sqlite3';
import { TranslationEntry } from '../domain/translationEntry';
import { logger } from '../logger'; // Add logger import

export class TranslationRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.initializeTable();
  }

  private initializeTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS translations (
        id TEXT PRIMARY KEY,
        resource_id TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        description TEXT,
        text TEXT NOT NULL,
        original_text TEXT NOT NULL,
        language TEXT NOT NULL,
        keywords TEXT,
        timestamp TEXT NOT NULL
      )
    `);
  }

  public upsertTranslationEntry(entry: TranslationEntry): void {
    const existingEntry = this.getTranslationEntryByResourceId(entry.resource_id);

    if (existingEntry) {
      const stmt = this.db.prepare(`
        UPDATE translations SET
          resource_id = @resource_id,
          title = @title,
          summary = @summary,
          description = @description,
          text = @text,
          original_text = @original_text,
          language = @language,
          keywords = @keywords,
          timestamp = @timestamp
        WHERE resource_id = @resource_id
      `);
      stmt.run(entry);
      logger.info(`Updated translation entry with resource_id: ${entry.resource_id}`);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO translations (
          id,
          resource_id,
          title,
          summary,
          description,
          text,
          original_text,
          language,
          keywords,
          timestamp
        ) VALUES (
          @id,
          @resource_id,
          @title,
          @summary,
          @description,
          @text,
          @original_text,
          @language,
          @keywords,
          @timestamp
        )
      `);
      stmt.run(entry);
      logger.info(`Inserted new translation entry with resource_id: ${entry.resource_id}`);
    }
  }

  public getTranslationEntryByResourceId(resource_id: string): TranslationEntry | null {
    const stmt = this.db.prepare('SELECT * FROM translations WHERE resource_id = ?');
    const result = stmt.get(resource_id);
    return result ? result as TranslationEntry : null;
  }

  public getTranslationEntryById(id: string): TranslationEntry | null {
    const stmt = this.db.prepare('SELECT * FROM translations WHERE id = ?');
    const result = stmt.get(id);
    return result ? result as TranslationEntry : null;
  }
}