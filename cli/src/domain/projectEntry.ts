import { v4 as uuidv4 } from 'uuid';

export interface ProjectEntry {
  id: string;
  value: string;
  timestamp: string;
}

export const factoryProjectEntry = (
  value: string
): ProjectEntry => {
  return {
    id: uuidv4(),
    value: value,
    timestamp: new Date().toISOString(),
  };
}