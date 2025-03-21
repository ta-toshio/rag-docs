import { ChatHistory } from '@/domain/chat-history';
import db from "@/infrastructure/db/sqlite";


export async function getChatHistories(sessionId: string) {
  const stmt = db.prepare(
    `SELECT messages 
     FROM chat_sessions 
     WHERE session_id = ?`
  );
  return stmt.all(sessionId) as ChatHistory[];
}

export async function saveChatHistories(
  sessionId: string,
  messages: { role: 'user' | 'assistant', message: string }[]
) {
  const promises = []
  for (const message of messages) {
    promises.push(
      saveChatHistory(sessionId, message.role, message.message)
    );
  }
  await Promise.all(promises);
}


export async function saveChatHistory(
  sessionId: string, 
  role: string,
  content: string 
) {
  const stmt = db.prepare(`
    INSERT INTO chat_sessions (
      session_id, 
      role,
      messages
    )
    VALUES (?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE 
    SET messages = excluded.messages, 
        role = excluded.role,
        updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(sessionId, role, content);
}
