import sqlite from "@/infrastructure/db/sqlite";
import { FileTreeEntry } from "@/domain/file-tree";

export async function getFileTreesByResourceIds(resourceIds: string[], projectId: string): Promise<FileTreeEntry[]> {
  const placeholders = resourceIds.map(() => '?').join(',');
  const fileTreesQuery = `
    SELECT
      id,
      project_id,
      resource_id,
      domain,
      name,
      type,
      path,
      parent
    FROM file_trees
    WHERE resource_id IN (${placeholders}) AND project_id = ?
  `;

  const fileTreeParams = [...resourceIds, projectId];
  return await sqlite.prepare(fileTreesQuery).all(fileTreeParams) as FileTreeEntry[];
}
