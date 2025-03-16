export interface FileTreeEntry {
  id: string;
  project_id: string;
  resource_id: string;
  domain: string;
  name: string;
  type: "file" | "folder";
  path: string;
  parent: string | null;
  timestamp: string;
  sort_order: number;
}
