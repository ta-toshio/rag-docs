import type React from "react"

import ChatPageComponent from "@/app/projects/[id]/chat/page"

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // const history = await getChatHistories(sessionId);

  return <ChatPageComponent projectId={id} />
}

