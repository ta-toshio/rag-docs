export interface ChatHistory {
    id: string; 
    session_id: string; // セッション識別子（UUID）
    message: string; // 会話履歴
    role: 'user' | 'assistant'; // user or assistant
    created_at: Date; // セッション開始時間
    updated_at: Date; // 最終更新時間
}
