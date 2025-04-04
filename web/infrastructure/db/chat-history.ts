import { ChatHistory } from '@/domain/chat-history';
import db from "@/infrastructure/db/sqlite";

export async function getChatHistory(id: string) {
  const stmt = db.prepare(
    `SELECT *
     FROM chat_sessions 
     WHERE id = ?`
  );
  return stmt.get(id) as ChatHistory;
}

export async function getChatHistories(sessionId: string) {
  const stmt = db.prepare(
    `SELECT *
     FROM chat_sessions 
     WHERE session_id = ?`
  );
  return stmt.all(sessionId) as ChatHistory[];
}


export async function createChatHistory(
  id: string,
  projectId: string,
  sessionId: string, 
  role: string,
  message: string 
) {
  const stmt = db.prepare(`
    INSERT INTO chat_sessions (
      id,
      project_id,
      session_id, 
      role,
      message,
      timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, projectId, sessionId, role, message, new Date().toISOString());
}


export async function getDistinctSessionIds(projectId: string) {
  // @TODO chat_sessionsとchat_session_messagesに分ける
  const stmt = db.prepare(
    `SELECT
      id,
      session_id,
      project_id,
      role,
      message,
      timestamp
     FROM chat_sessions
     WHERE (session_id, timestamp) IN (
       SELECT session_id, MIN(timestamp)
       FROM chat_sessions
       GROUP BY session_id
     )
      AND project_id = ?
     ORDER BY session_id`
  );
  return stmt.all([projectId]) as ChatHistory[];
}
