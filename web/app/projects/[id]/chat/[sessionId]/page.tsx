import type React from "react"

import ChatPageComponent from "@/components/page/chat-page";
import { getChatHistories, getDistinctSessionIds } from "@/infrastructure/db/chat-history";

export default async function ChatPage({ params }: { params: Promise<{ id: string, sessionId: string }> }) {
  const { id, sessionId } = await params

  const history = await getChatHistories(sessionId);
  const sessions = await getDistinctSessionIds(id);

  return <ChatPageComponent
    projectId={id}
    sessionId={sessionId}
    messages={history}
    sessions={sessions}
  />
}

