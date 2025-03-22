"use client"

import type React from "react"

import { ProjectSelector } from "@/components/project-selector"

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center">
          <ProjectSelector />
        </div>
      </header>
    </div>
  )
}

