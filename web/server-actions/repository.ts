import { FileTreeEntry } from "@/domain/file-tree";
import { TranslationEntry } from "@/domain/translation";
import db from "@/lib/db";

export async function getFiles(projectId: string): Promise<FileTreeEntry[]> {
  try {
    return await db
    .prepare(
      `SELECT
        id,
        project_id,
        resource_id,
        domain,
        name,
        type,
        path,
        parent
      FROM file_trees
      WHERE project_id = ?
      ORDER BY sort_order ASC`
    )
    .all(projectId) as FileTreeEntry[];
  } catch (error) {
    console.error("Error in getFiles:", error);
    return [];
  }
}

export async function getTranslation(fileId: string) {
  try {
    return await db
    .prepare(
      `SELECT
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
      WHERE resource_id = ?`
    )
    .get(fileId) as TranslationEntry;
  } catch (error) {
    console.error("Error in getFiles:", error);
    return [];
  }
}


export async function getFileTree(id: string) {
  try {
    return await db
    .prepare(
      `SELECT
        id,
        project_id,
        resource_id,
        domain,
        name,
        type,
        path,
        parent
      FROM file_trees
      WHERE id = ?`
    )
    .get(id) as FileTreeEntry;
  } catch (error) {
    console.error("Error in getFileTree:", error);
    return null;
  }
}