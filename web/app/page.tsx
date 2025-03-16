"use client"

import type React from "react"

import { MessageCircle } from "lucide-react"
import Link from "next/link"
import { ProjectSelector } from "@/components/project-selector"
import { SearchBar } from "@/components/search-bar"

export default function Home() {

  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center">
          <ProjectSelector />
        </div>
        <SearchBar />
        <Link href="/chat" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </Link>
      </header>
    </div>
  )
}

