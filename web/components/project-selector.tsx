"use client"

import * as React from "react"
import { Check, ChevronsUpDown, FolderGit2 } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ProjectEntry } from "@/domain/project";
import { useRouter } from "next/Navigation"


export function ProjectSelector({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([]);
  const [value, setValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch("/api/projects");
      const projects: ProjectEntry[] = await response.json();
      setProjects(projects.map((project) => ({
        value: project.id,
        label: project.value,
      })));
      if (projects.length > 0 && projects.some((project) => project.id === projectId)) {
        setValue(projectId)
      }
    };

    fetchProjects();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-52 justify-between">
          <div className="flex items-center gap-2 truncate">
            <FolderGit2 className="h-4 w-4" />
            {value ? projects.find((project) => project.value === value)?.label : "Select project..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0">
        <Command>
          {/* <CommandInput placeholder="Search projects..." /> */}
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            {projects.length > 0 ? (
              <CommandGroup>
                {projects.map((project) => (
                  <CommandItem
                    key={project.value}
                    value={project.value}
                    className="truncate"
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      router.push(`/projects/${currentValue}`);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === project.value ? "opacity-100" : "opacity-0")} />
                    {project.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>Loading projects...</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
