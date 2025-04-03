'use server'

import { v7 as uuidv7 } from 'uuid';
import { redirect } from 'next/navigation'
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { searchForRAG } from '@/infrastructure/vector/qdrant';
import { chatModel, getEmbedding } from '@/infrastructure/llm/gemini';
import { getTranslationsByResourceIds } from '@/infrastructure/db/translation';
import { createChatHistory, getChatHistories, getChatHistory } from '@/infrastructure/db/chat-history';

// セッションごとの会話履歴管理用
interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
}

// セッションごとの会話履歴管理用メモリ
const sessionMessages: Record<string, ChatMessage[]> = {};

// RAGの結果と質問を統合するためのプロンプトテンプレート
const ragPrompt = ChatPromptTemplate.fromTemplate(`
あなたは親切なアシスタントです。以下の情報を参考にして、ユーザーの質問に答えてください。

コンテキスト情報:
{context}

チャット履歴:
{chat_history}

ユーザーの質問: {question}

回答:
`);

export async function processChat(
  userInput: string,
  projectId: string,
  passedSessionId?: string,
  // userId: string
) {

  const isStartingSession = passedSessionId === undefined;
  const sessionId = passedSessionId || uuidv7();
  // DBから過去のチャット履歴を取得
  const pastMessages = await getChatHistories(sessionId);

  // セッションが初回なら、会話履歴を初期化
  if (!sessionMessages[sessionId]) {
    sessionMessages[sessionId] = pastMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      message: msg.message
    }));
  }

  // ユーザー入力に基づくRAG検索（埋め込み取得と文書検索）
  const vector = await getEmbedding(userInput);
  const { highScoreDocs, normalScoreDocs } = await searchForRAG(vector, projectId);
  const highScoreDocsResourceIds = highScoreDocs.map(doc => doc.id);
  const normalScoreDocsResourceIds = normalScoreDocs.map(doc => doc.id);

  const highScoreTranslations = highScoreDocsResourceIds.length > 0
    ? await getTranslationsByResourceIds(highScoreDocsResourceIds)
    : [];
  const normalScoreTranslations = normalScoreDocsResourceIds.length > 0
    ? await getTranslationsByResourceIds(normalScoreDocsResourceIds)
    : [];

  // RAGの結果を優先度付きのコンテキストとして整形
  const prioritizedContext = [
    ...highScoreTranslations.map(translation => `🔹 重要情報:\n${translation.text}\n\n`),
    ...normalScoreTranslations.map(translation => `🔸 参考情報:\n${translation.text}\n\n`),
  ].join("\n");

  // 会話履歴をフォーマット
  const formattedChatHistory = sessionMessages[sessionId]
    .map(msg => `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.message}`)
    .join('\n\n');

  // 過去の会話と検索結果を考慮して回答を生成するチェーンを作成
  const ragChain = RunnableSequence.from([
    {
      // 入力を構造化
      question: (input: { question: string }) => input.question,
      chat_history: () => formattedChatHistory,
      context: () => prioritizedContext
    },
    // RAGプロンプトを適用
    ragPrompt,
    // LLMで回答を生成
    chatModel,
    // 出力をテキストに変換
    new StringOutputParser()
  ]);

  // チェーンを実行して回答を生成
  const response = await ragChain.invoke({
    question: userInput
  });

  // メモリに今回のやり取りを追加
  sessionMessages[sessionId].push({ role: 'user', message: userInput });
  sessionMessages[sessionId].push({ role: 'assistant', message: response });

  // チャット履歴に今回のやり取りを追加し、DBへ保存
  const userMessageId = uuidv7();
  const assistantMessageId = uuidv7();
  await createChatHistory(userMessageId, projectId, sessionId, 'user', userInput);
  await createChatHistory(assistantMessageId, projectId, sessionId, 'assistant', response);

  if (isStartingSession) {
    redirect(`/projects/${projectId}/chat/${sessionId}`);
    return;
  }

  return {
    user: await getChatHistory(userMessageId),
    assistant: await getChatHistory(assistantMessageId)
  };
}
