"use client"

import * as React from "react"
import { Check, ChevronsUpDown, FolderGit2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const projects = [
  {
    value: "gitpod",
    label: "Gitpod [GitHub]",
  },
  {
    value: "next",
    label: "Next.js [GitHub]",
  },
  {
    value: "react",
    label: "React [GitHub]",
  },
]

export function ProjectSelector() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("gitpod")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-48 justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4" />
            {value ? projects.find((project) => project.value === value)?.label : "Select project..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects.map((project) => (
                <CommandItem
                  key={project.value}
                  value={project.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === project.value ? "opacity-100" : "opacity-0")} />
                  {project.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

