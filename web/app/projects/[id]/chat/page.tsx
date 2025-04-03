import type React from "react"

import ChatPageComponent from "@/components/page/chat-page";
import { getDistinctSessionIds } from "@/infrastructure/db/chat-history";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const sessions = await getDistinctSessionIds(id);

  return <ChatPageComponent projectId={id} sessions={sessions}/>
}


