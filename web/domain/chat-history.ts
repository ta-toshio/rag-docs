export interface ChatHistory {
    id: string; 
    session_id: string; // セッション識別子（UUID）
    message: string; // 会話履歴
    role: 'user' | 'assistant'; // user or assistant
    timestamp: string; // セッション開始時間
}
