# File Tree Registration Implementation Plan

## Required Changes

1. **cli.ts**
   - Import FileTreeHandler
   - Initialize FileTreeHandler with SQLite database
   - Call upsertFileTreeEntry for each FileTreeEntry

2. **Database Initialization**
   - Create SQLite database file if not exists
   - Ensure proper database path handling

## Example Code
```typescript
// In cli.ts
import { FileTreeHandler } from './repository/fileTreeHandler';
import Database from 'better-sqlite3';

// Initialize database
const db = new Database('database.sqlite');
const fileTreeHandler = new FileTreeHandler(db);

// In url command action
const fileTreeEntry = factoryFileTreeEntry(url, entry.title);
fileTreeHandler.upsertFileTreeEntry(fileTreeEntry);
```

## Error Handling
- Database connection errors
- Invalid FileTreeEntry data
- Concurrent access issues

## Testing
- Unit tests for FileTreeHandler
- Integration test for full registration flow