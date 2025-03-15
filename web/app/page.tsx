"use client"

import type React from "react"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import Link from "next/link"
import { ProjectSelector } from "@/components/project-selector"
import { SearchBar } from "@/components/search-bar"
import { TreeView } from "@/components/tree-view"
import { MarkdownViewer } from "@/components/markdown-viewer"
import { X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchFileContent } from "@/lib/file-service"
import type { FileType } from "@/types/file"

export default function Home() {
  // State for open files and active file
  const [openFiles, setOpenFiles] = useState<FileType[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Handle file selection from the tree view
  const handleFileSelect = async (file: FileType) => {
    // Only handle markdown files
    if (file.type !== "file" || !file.name.endsWith(".md")) {
      return
    }

    setIsLoading(true)

    try {
      // Check if the file is already open
      const existingFileIndex = openFiles.findIndex((f) => f.id === file.id)

      if (existingFileIndex === -1) {
        // If file is not open, add it to open files
        setOpenFiles((prev) => [...prev, file])
      }

      // Set as active file
      setActiveFileId(file.id)

      // Fetch content if we don't have it yet
      if (!fileContents[file.id]) {
        const content = await fetchFileContent(file.path)
        setFileContents((prev) => ({
          ...prev,
          [file.id]: content,
        }))
      }
    } catch (error) {
      console.error("Error loading file:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab click
  const handleTabClick = (fileId: string) => {
    setActiveFileId(fileId)
  }

  // Handle tab close
  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()

    // Remove the file from open files
    const newOpenFiles = openFiles.filter((file) => file.id !== fileId)
    setOpenFiles(newOpenFiles)

    // If we closed the active tab, activate another tab or set to null
    if (fileId === activeFileId) {
      setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[0].id : null)
    }
  }

  // Get the active file and its content
  const activeFile = activeFileId ? openFiles.find((file) => file.id === activeFileId) : null
  const activeContent = activeFile ? fileContents[activeFile.id] : null

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

      {/* Tab Bar - Only show if there are open files */}
      {openFiles.length > 0 && (
        <div className="flex h-9 items-center border-b bg-muted/30 px-2 overflow-x-auto">
          {openFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleTabClick(file.id)}
              className={cn(
                "flex h-8 items-center rounded px-3 text-sm mr-1 cursor-pointer",
                activeFileId === file.id ? "bg-background" : "hover:bg-muted",
              )}
            >
              <FileText className="h-4 w-4 mr-2 text-blue-500" />
              <span>{file.name}</span>
              <button className="ml-2 rounded-full p-1 hover:bg-muted" onClick={(e) => handleCloseTab(e, file.id)}>
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30">
          <TreeView onFileSelect={handleFileSelect} activeFileId={activeFileId} />
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : activeFile && activeContent ? (
            <MarkdownViewer content={activeContent} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">No file selected</h2>
              <p className="text-muted-foreground max-w-md">
                Select a markdown file from the file tree to view its content.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

