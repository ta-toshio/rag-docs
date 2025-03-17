"use client"

import { useState, useRef } from "react"
import { MessageCircle } from "lucide-react"
import Link from "next/link"
import { ProjectSelector } from "@/components/project-selector"
import { SearchBar } from "@/components/search-bar"
import { TreeView, TreeViewHandle } from "@/components/tree-view"
import { MarkdownViewer } from "@/components/markdown-viewer"
import { X, FileText, Languages, Text, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { TranslationEntry } from "@/domain/translation"
import { TreeNode } from "@/domain/tree-node"
import { TooltipWrapper } from "../ui-wrapper/tooltip"
import useLocalStorage from "@/hooks/use-local-storage"
import { SearchResult } from "@/server-actions/search"
import { FileTreeEntry } from "@/domain/file-tree"
import { HybridNode } from "@/domain/build-tree"

type OutputType = "translation" | "summary" | "original"
type OutputTypeField = "text" | "summary" | "original_text"

const outputTypeMap: Record<OutputType, OutputTypeField> = {
  translation: "text",
  summary: "summary",
  original: "original_text",
}

export default function ProjectPage({ projectId, files, flatFiles }: { projectId: string, files: TreeNode[], flatFiles: HybridNode[] }) {
  // State for open files and active file
  const [openFiles, setOpenFiles] = useState<TreeNode[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [fileContents, setFileContents] = useState<Record<string, TranslationEntry>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [outputType, setOutputType] = useLocalStorage<OutputType>(
    "outputType",
    "translation"
  );
  const [expandedFolders, setExpandedFolders] = useLocalStorage<string[]>(
    "expandedFolders",
    []
  );
  
  // TreeViewへの参照
  const treeViewRef = useRef<TreeViewHandle>(null);

  // Handle file selection from the tree view
  const handleFileSelect = async (file: TreeNode) => {
    // Only handle markdown files
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
        const response = await fetch(`/api/projects/${projectId}/files/${file.id}`);
        const data: TranslationEntry | null = await response.json();
        if (!data) {
            console.error("Failed to retrieve file content:", file.id);
            return;
        }

        // const content = await fetchFileContent(file.path)
        setFileContents((prev) => ({
          ...prev,
          [file.id]: data,
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

  const handleOutputTypeChange = (type: OutputType) => {
    setOutputType(type)
  }

  const expandPathInTree = (path: string) => {
    const parts = path.split('/')
    let currentPath = ''
    const folderIds: string[] = []
    
    for (let i = 0; i < parts.length; i++) {
      currentPath += (currentPath ? '/' : '') + parts[i]
      const _currentPath = '/' + currentPath

      for (const node of flatFiles) {
        if ((node.type === "folder" || node.isHybrid) && node.path === _currentPath) {
          folderIds.push(node.id)
        }
      }
    }

    // TreeView の expandFolders 関数を呼び出す
    if (treeViewRef.current && folderIds.length > 0) {
      treeViewRef.current.expandFolders(folderIds)
    }
  }

  // 検索結果からファイルを選択したときの処理
  const handleSearchFileSelect = (searchResult: SearchResult) => {
    // ファイルツリーから対応するノードを探す
    const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node
        }
        if (node.children) {
          const found = findNodeById(node.children, id)
          if (found) {
            return found
          }
        }
      }
      return null
    }

    const node = findNodeById(files, searchResult.id)
    
    if (node) {
      // パスからフォルダを展開
      expandPathInTree(node.path)
      // ファイルを選択
      handleFileSelect(node)
    } 
  }

  // Get the active file and its content
  const activeFile = activeFileId ? openFiles.find((file) => file.id === activeFileId) : null
  const activeContent = activeFile && fileContents[activeFile.id]
    ? fileContents[activeFile.id][outputTypeMap[outputType]]
    : null;

  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center">
          <ProjectSelector projectId={projectId} />
        </div>
        <SearchBar onFileSelect={handleSearchFileSelect} />
        <Link href="/chat" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <MessageCircle className="h-4 w-4" />
          <span>Chat</span>
        </Link>
      </header>

      {/* Tab Bar - Only show if there are open files */}
      {openFiles.length > 0 && (
        <div className="flex h-9 items-center border-b bg-muted/30 px-2 overflow-x-auto justify-between">
          <div className="flex items-center overflow-x-auto">
            {openFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleTabClick(file.id)}
                className={cn(
                  "flex h-8 items-center rounded px-3 text-sm mr-1 cursor-pointer whitespace-nowrap",
                  activeFileId === file.id ? "bg-background" : "hover:bg-muted",
                )}
              >
                <FileText className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                <span className="truncate max-w-[150px]" title={file.name}>
                  {file.name}
                </span>
                <button
                  className="ml-2 rounded-full p-1 hover:bg-muted shrink-0"
                  onClick={(e) => handleCloseTab(e, file.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center border-l pl-2 shrink-0">
            <TooltipWrapper tooltip="translation">
              <button
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded hover:bg-muted",
                  outputType === "translation" && "bg-muted"
                )}
                onClick={() => handleOutputTypeChange("translation")}
              >
                <Languages className="h-3 w-3" />
              </button>
            </TooltipWrapper>
            <TooltipWrapper tooltip="summary">
              <button
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded hover:bg-muted",
                  outputType === "summary" && "bg-muted"
                )}
                onClick={() => handleOutputTypeChange("summary")}
              >
                <ClipboardList className="h-3 w-3" />
              </button>
            </TooltipWrapper>
            <TooltipWrapper tooltip="original">
              <button
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded hover:bg-muted",
                  outputType === "original" && "bg-muted"
                )}
                onClick={() => handleOutputTypeChange("original")}
              >
                <Text className="h-3 w-3" />
              </button>
            </TooltipWrapper>
          </div>
        </div>
      )}


      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 overflow-auto">
          <TreeView
            ref={treeViewRef}
            fileList={files}
            onFileSelect={handleFileSelect}
            activeFileId={activeFileId}
          />
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
