import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import type { FileType } from "@/types/file"

// Base directory for resource files
const RESOURCES_DIR = path.join(process.cwd(), "resources")

// Generate a unique ID for each file/folder
let idCounter = 0
function generateId(): string {
  return (idCounter++).toString()
}

// Recursively build the file tree
async function buildFileTree(dirPath: string, relativePath = ""): Promise<FileType[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const result: FileType[] = []

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name)
      const entryRelativePath = path.join(relativePath, entry.name)

      if (entry.isDirectory()) {
        const children = await buildFileTree(entryPath, entryRelativePath)
        result.push({
          id: generateId(),
          name: entry.name,
          path: entryRelativePath,
          type: "folder",
          children,
        })
      } else {
        // Get file extension
        const extension = path.extname(entry.name).slice(1)

        result.push({
          id: generateId(),
          name: entry.name,
          path: entryRelativePath,
          type: "file",
          extension,
        })
      }
    }

    // Sort: folders first, then files, both alphabetically
    return result.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name)
      }
      return a.type === "folder" ? -1 : 1
    })
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
    return []
  }
}

export async function GET() {
  try {
    // Check if resources directory exists, create it if not
    try {
      await fs.access(RESOURCES_DIR)
    } catch {
      await fs.mkdir(RESOURCES_DIR, { recursive: true })

      // Create some example files if the directory is new
      await fs.writeFile(
        path.join(RESOURCES_DIR, "welcome.md"),
        '# Welcome to Markdown Explorer\n\nThis is a sample markdown file to get you started.\n\n## Features\n\n- Browse files and folders\n- View markdown files with syntax highlighting\n- Navigate through your documentation\n\n```javascript\nconsole.log("Hello, world!");\n```',
      )

      // Create a docs folder with some example files
      const docsDir = path.join(RESOURCES_DIR, "docs")
      await fs.mkdir(docsDir, { recursive: true })

      await fs.writeFile(
        path.join(docsDir, "getting-started.md"),
        "# Getting Started\n\nThis guide will help you get started with the application.\n\n## Installation\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Configuration\n\nEdit the `.env` file to configure the application.",
      )

      await fs.writeFile(
        path.join(docsDir, "api-reference.md"),
        "# API Reference\n\n## Endpoints\n\n### GET /api/files\n\nReturns the file structure.\n\n### GET /api/file?path=file-path\n\nReturns the content of a specific file.",
      )
    }

    const files = await buildFileTree(RESOURCES_DIR)
    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error in GET /api/files:", error)
    return NextResponse.json({ error: "Failed to retrieve file structure" }, { status: 500 })
  }
}

