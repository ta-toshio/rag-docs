import { v7 as uuidv7 } from 'uuid';
import * as path from 'path';

export interface FileTreeEntry {
  id: string;
  resource_id: string;
  domain: string;
  name: string;
  type: "file" | "folder";
  path: string;
  parent: string | null;
  timestamp: string;
  sort_order: number;
}

export const factoryFileTreeEntry = (
  urlString: string,
  name: string,
  sort_order: number
): FileTreeEntry => {
  const parsedUrl = new URL(urlString);
  const pathname = parsedUrl.pathname;
  const parentPath = path.dirname(pathname) === '/' ? null : path.dirname(pathname);

  return {
    id: uuidv7(),
    resource_id: urlString,
    domain: parsedUrl.hostname || '',
    name: name,
    type: 'file', // file or folder
    path: pathname,
    parent: parentPath,
    timestamp: new Date().toISOString(),
    sort_order: sort_order
  };
}