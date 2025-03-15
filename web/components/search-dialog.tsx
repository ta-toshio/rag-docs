"use client"

import * as React from "react"
import { File, FolderOpen, ChevronRight, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface SearchResult {
  id: string
  title: string
  category: string
  path: string
  type: "file" | "folder"
  children?: SearchResult[]
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

export function SearchDialog({ open, onOpenChange, searchQuery, onSearchQueryChange }: SearchDialogProps) {
  const [results, setResults] = React.useState<SearchResult[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input when dialog opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [open])

  // Simulated search results based on query
  React.useEffect(() => {
    if (!searchQuery) {
      setResults([])
      return
    }

    // Simulate API call with sample data
    const sampleResults: SearchResult[] = [
      {
        id: "1",
        title: "Custom Instructions",
        category: "Advanced Usage",
        path: "/docs/custom-instructions",
        type: "folder",
        children: [
          {
            id: "2",
            title: "Global Custom Instructions",
            category: "Custom Instructions",
            path: "/docs/custom-instructions/global",
            type: "file",
          },
          {
            id: "3",
            title: "Examples of Custom Instructions",
            category: "Custom Instructions",
            path: "/docs/custom-instructions/examples",
            type: "file",
          },
        ],
      },
      {
        id: "4",
        title: "Custom Modes",
        category: "Advanced Usage",
        path: "/docs/custom-modes",
        type: "folder",
        children: [
          {
            id: "5",
            title: "Why Use Custom Modes?",
            category: "Custom Modes",
            path: "/docs/custom-modes/why-use",
            type: "file",
          },
          {
            id: "6",
            title: "Creating Custom Modes",
            category: "Custom Modes",
            path: "/docs/custom-modes/creating",
            type: "file",
          },
        ],
      },
      {
        id: "7",
        title: "Customization",
        category: "Roo Code Docs",
        path: "/docs/customization",
        type: "file",
      },
      {
        id: "8",
        title: "Custom Modes",
        category: "Basic Usage • Using Modes",
        path: "/docs/custom-modes/basic",
        type: "file",
      },
    ].filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setResults(sampleResults)
  }, [searchQuery])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <div className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search documentation..."
              className="h-12 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQueryChange("")}
                className="ml-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <div className="max-h-[500px] overflow-y-auto p-2">
            {results.length === 0 && searchQuery && (
              <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
            )}
            {results.map((result) => (
              <ResultItem key={result.id} item={result} searchQuery={searchQuery} />
            ))}
            {results.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <button className="flex w-full cursor-pointer items-center justify-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                  See all results
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ResultItemProps {
  item: SearchResult
  searchQuery: string
  level?: number
}

function ResultItem({ item, searchQuery, level = 0 }: ResultItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const hasChildren = item.children && item.children.length > 0

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!searchQuery) return text

    const regex = new RegExp(`(${searchQuery})`, "gi")
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase() === searchQuery.toLowerCase()) {
            return (
              <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
                {part}
              </span>
            )
          }
          return part
        })}
      </>
    )
  }

  return (
    <>
      <button
        className={cn(
          "flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
          level > 0 && "ml-4",
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-1 items-center gap-2">
          {item.type === "folder" ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <File className="h-4 w-4 shrink-0 text-gray-500" />
          )}
          <div className="flex flex-col text-left">
            <div className="font-medium">{highlightText(item.title)}</div>
            <div className="text-xs text-muted-foreground">{item.category}</div>
          </div>
        </div>
        {hasChildren && (
          <ChevronRight
            className={cn(
              "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-90",
            )}
          />
        )}
      </button>
      {hasChildren &&
        isExpanded &&
        item.children?.map((child) => (
          <ResultItem key={child.id} item={child} searchQuery={searchQuery} level={level + 1} />
        ))}
    </>
  )
}

