import sqlite from "@/infrastructure/db/sqlite";
import { TranslationEntry } from "@/domain/translation";

export async function getTranslationsByResourceIds(resourceIds: string[]): Promise<TranslationEntry[]> {
  const placeholders = resourceIds.map(() => '?').join(',');
  const translationsQuery = `
    SELECT
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
    FROM translations
    WHERE resource_id IN (${placeholders})
  `;

  return await sqlite.prepare(translationsQuery)
    .all(resourceIds) as TranslationEntry[];
}
