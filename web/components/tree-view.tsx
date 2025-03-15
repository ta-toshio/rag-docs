"use client"

import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileType } from "@/types/file"

// Sample file structure
const files: FileType[] = [
  {
    id: "folder-1",
    name: "Documentation",
    type: "folder",
    path: "/documentation",
    children: [
      {
        id: "file-1",
        name: "getting-started.md",
        type: "file",
        path: "/documentation/getting-started.md",
      },
      {
        id: "file-2",
        name: "api-reference.md",
        type: "file",
        path: "/documentation/api-reference.md",
      },
      {
        id: "folder-2",
        name: "Guides",
        type: "folder",
        path: "/documentation/guides",
        children: [
          {
            id: "file-3",
            name: "installation.md",
            type: "file",
            path: "/documentation/guides/installation.md",
          },
          {
            id: "file-4",
            name: "configuration.md",
            type: "file",
            path: "/documentation/guides/configuration.md",
          },
        ],
      },
    ],
  },
  {
    id: "folder-3",
    name: "Examples",
    type: "folder",
    path: "/examples",
    children: [
      {
        id: "file-5",
        name: "basic-usage.md",
        type: "file",
        path: "/examples/basic-usage.md",
      },
      {
        id: "file-6",
        name: "advanced-features.md",
        type: "file",
        path: "/examples/advanced-features.md",
      },
    ],
  },
  {
    id: "file-7",
    name: "README.md",
    type: "file",
    path: "/README.md",
  },
  {
    id: "file-8",
    name: "CONTRIBUTING.md",
    type: "file",
    path: "/CONTRIBUTING.md",
  },
]

interface TreeViewProps {
  onFileSelect?: (file: FileType) => void
  activeFileId?: string | null
}

export function TreeView({ onFileSelect, activeFileId }: TreeViewProps) {
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set(["folder-1", "folder-3"]), // Expand some folders by default
  )

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  interface TreeViewItemProps {
    item: FileType
    level?: number
  }

  function TreeViewItem({ item, level = 0 }: TreeViewItemProps) {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedFolders.has(item.id)
    const isMarkdown = item.name.endsWith(".md")
    const isActive = activeFileId === item.id

    const handleClick = () => {
      if (hasChildren) {
        toggleFolder(item.id)
      } else if (onFileSelect) {
        onFileSelect(item)
      }
    }

    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent",
            "focus:bg-accent focus:outline-none",
            isActive && "bg-accent text-accent-foreground font-medium",
          )}
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
        >
          {hasChildren ? (
            <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-90")} />
          ) : (
            <span className="w-4" />
          )}
          {item.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-blue-500" />
            )
          ) : isMarkdown ? (
            <FileText className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <File className="h-4 w-4 shrink-0 text-gray-500" />
          )}
          <span className="truncate">{item.name}</span>
        </button>
        {hasChildren && isExpanded && (
          <div>
            {item.children.map((child) => (
              <TreeViewItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="mb-2 px-2 py-1 text-sm font-medium text-muted-foreground">Files</div>
      {files.map((file) => (
        <TreeViewItem key={file.id} item={file} />
      ))}
    </div>
  )
}

