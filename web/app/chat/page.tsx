"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Globe, Plus, MessageSquare, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Message {
  id: string
  content: string
  isUser: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: 'Leonardo was educated at Bugia, and afterwards toured the Mediterranean.',
      isUser: true,
    },
    {
      id: "2",
      content: `The map or diagram of which Leonardo Dati in his poem on the Sphere (Della Spera) wrote in 1422 " un T dentre a uno 0 mostra it disegno " (a T within an 0 shows the design) is one of the most persistent types among the circular or wheel maps of the world.`,
      isUser: false,
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"
      // Set the height to scrollHeight to fit the content
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 38), 200)
      textarea.style.height = `${newHeight}px`
    }
  }, [inputValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim()) {
        // Add user message
        const newMessage: Message = {
          id: Date.now().toString(),
          content: inputValue,
          isUser: true,
        }
        setMessages([...messages, newMessage])
        setInputValue("")
      }
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              Previous Chat 1
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              Previous Chat 2
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-12 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">ChatGPT 4.0</h1>
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4" />
              共有する
            </Button>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.isUser ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
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
                onKeyDown={handleKeyDown}
                placeholder="質問してみましょう"
                className="flex-1 resize-none border-0 bg-transparent outline-none min-h-[38px] max-h-[200px] py-1"
                rows={1}
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  {inputValue.length > 0 && "Press Enter to send, Shift+Enter for new line"}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Globe className="h-4 w-4" />
                    <span className="ml-2">検索</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    Deep Research
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

