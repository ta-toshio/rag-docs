import { Database } from 'better-sqlite3';
import { ProjectEntry } from '../domain/projectEntry';
import { logger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

export class ProjectRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.initializeTable();
  }

  private initializeTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        value TEXT NOT NULL UNIQUE,
        timestamp TEXT NOT NULL
      )
    `);
  }

  public createProject(project: ProjectEntry): void {
    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id,
        value,
        timestamp
      ) VALUES (
        @id,
        @value,
        @timestamp
      )
    `);

    stmt.run(project);
    logger.info(`Inserted new project with value: ${project.value}`);
  }

  public getProjectByValue(value: string): ProjectEntry | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE value = ?');
    const result = stmt.get(value);
    return result ? result as ProjectEntry : null;
  }
}