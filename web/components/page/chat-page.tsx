"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, MessageSquare, Home, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChatHistory } from "@/domain/chat-history"
import { processChat } from "@/actions/chat"

interface ChatPageProps {
  projectId: string
  sessionId?: string
  messages?: ChatHistory[]
  sessions: ChatHistory[]
}

export default function ChatPageComponent({
  projectId,
  sessionId,
  messages: initalMessages,
  sessions,
}: ChatPageProps) {
  const [messages, setMessages] = useState<ChatHistory[]>(initalMessages || [])

  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const newMessageRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = async () => {
    if (!inputValue) return;

    setIsLoading(true);

    const result = await processChat(inputValue, projectId, sessionId);
    if (!result) return;
    const { user, assistant } = result;
    setMessages([
      ...messages,
      user,
      assistant,
    ]);
    setInputValue("");
    setIsLoading(false);

    setTimeout(() => {
      if (newMessageRef.current) {
        newMessageRef.current.scrollIntoView();
      }
    }, 100); 
  };

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 100);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <Link href={`/projects/${projectId}/chat`}>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {sessions && sessions.map(session => (
              <Link
                href={`/projects/${projectId}/chat/${session.session_id}`}
                key={`session-${session.session_id}`}
              >
                <Button
                    key={`session-${session.id}`}
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{session.message}</span>
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-12 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* <h1 className="font-semibold">ChatGPT 4.0</h1>
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4" />
              共有する
            </Button> */}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href={`/projects/${projectId}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
              <FolderTree className="h-4 w-4" />
              <span>Explorer</span>
            </Link>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                ref={index === messages.length - 2 ? newMessageRef : null}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-4">
            <div className="flex-1 flex flex-col gap-2 border rounded-lg px-3 py-2 bg-white">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                disabled={isLoading}
                // onKeyDown={handleKeyDown}
                placeholder="質問してみましょう"
                className="flex-1 resize-none border-0 bg-transparent outline-none min-h-[38px] max-h-[200px] py-1"
                rows={1}
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  {inputValue.length > 0 && "Press Enter to send, Shift+Enter for new line"}
                </div>
                <div className="flex gap-2">
                  {/*
                  <Button variant="ghost" size="sm">
                    <Globe className="h-4 w-4" />
                    <span className="ml-2">検索</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    Deep Research
                  </Button>
                  */}
                  <Button
                    onClick={handleSubmit}
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? <span>Loading...</span> : <span className="ml-2">送信</span>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
