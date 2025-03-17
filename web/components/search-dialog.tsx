"use client"

import * as React from "react"
import { File, FolderOpen, ChevronRight, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { searchDocuments, SearchResult } from "@/server-actions/search"
import { useToast } from "@/hooks/use-toast"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  projectId: string
  onFileSelect?: (file: SearchResult) => void
}

export function SearchDialog({
  open,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  projectId,
  onFileSelect
}: SearchDialogProps) {
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Focus input when dialog opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [open])

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("query", searchQuery)
      formData.append("projectId", projectId)
      formData.append("topK", "5")

      const searchResults = await searchDocuments(formData)
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "検索エラー",
        description: error instanceof Error ? error.message : "検索中にエラーが発生しました。",
        variant: "destructive",
      })
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <div className="rounded-lg border shadow-md">
          <form onSubmit={handleSearch} className="flex items-center border-b px-3">
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
                type="button"
                onClick={() => onSearchQueryChange("")}
                className="ml-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
            <button type="submit" className="sr-only">Search</button>
          </form>
          <div className="max-h-[500px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="py-6 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">検索中...</p>
              </div>
            ) : (
              <>
                {results.length === 0 && searchQuery && (
                  <div className="py-6 text-center text-sm text-muted-foreground">検索結果がありません。</div>
                )}
                {results.map((result) => (
                  <ResultItem
                    key={result.id}
                    item={result}
                    searchQuery={searchQuery}
                    onFileSelect={onFileSelect}
                  />
                ))}
              </>
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
  onFileSelect?: (file: SearchResult) => void
}

function ResultItem({ item, searchQuery, level = 0, onFileSelect }: ResultItemProps) {
  // Highlight matching text
  const highlightText = (text: string) => {
    if (!searchQuery || !text) return text

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

  const handleClick = () => {
    if (onFileSelect) {
      onFileSelect(item);
    }
  };

  return (
    <>
      <div
        className="flex flex-1 items-center gap-2 mb-4 cursor-pointer hover:bg-accent/50 p-2 rounded"
        onClick={handleClick}
      >
        <File className="h-4 w-4 shrink-0 text-gray-500" />
        <div className="flex flex-col text-left">
          <div className="font-medium">{highlightText(item.name)}</div>
          <div className="text-xs text-muted-foreground">{item.path}</div>
          {item.hitText && (
            <div className="text-xs text-muted-foreground mt-1">{highlightText(item.hitText)}</div>
          )}
          {item.score !== undefined && (
            <div className="text-xs text-muted-foreground mt-1">スコア: {item.score.toFixed(2)}</div>
          )}
        </div>
      </div>
    </>
  )
}

