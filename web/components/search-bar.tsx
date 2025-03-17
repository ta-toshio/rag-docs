"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SearchDialog } from "@/components/search-dialog"
import { useParams } from "next/navigation"

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const params = useParams()
  const projectId = params.id as string

  return (
    <>
      <div className="relative w-80" onClick={() => setOpen(true)}>
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input type="search" placeholder="Search files..." className="pl-8 cursor-pointer" readOnly />
      </div>

      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        projectId={projectId}
      />
    </>
  )
}

