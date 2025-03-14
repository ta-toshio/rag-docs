import Database from 'better-sqlite3';

export function initializeDatabase(): Database.Database {
  const db = new Database('database.sqlite');
  return db;
}