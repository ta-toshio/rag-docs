import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

// Base directory for resource files
const RESOURCES_DIR = path.join(process.cwd(), "resources")

export async function GET() {
  try {
    // Check if resources directory exists, create it if not
    try {
      await fs.access(RESOURCES_DIR)
    } catch {
      await fs.mkdir(RESOURCES_DIR, { recursive: true })

      // Create a more comprehensive directory structure

      // Root level files
      await fs.writeFile(
        path.join(RESOURCES_DIR, "welcome.md"),
        '# Welcome to Markdown Explorer\n\nThis is a sample markdown file to get you started.\n\n## Features\n\n- Browse files and folders\n- View markdown files with syntax highlighting\n- Navigate through your documentation\n\n```javascript\nconsole.log("Hello, world!");\n```',
      )

      await fs.writeFile(
        path.join(RESOURCES_DIR, "readme.md"),
        "# Markdown Explorer\n\nA simple application to browse and view markdown files.\n\n## Getting Started\n\nSelect a file from the explorer to view its contents.\n\n## Features\n\n- Tree view of files and folders\n- Markdown rendering with syntax highlighting\n- Support for code blocks and other markdown features",
      )

      // Create docs folder with subfolders
      const docsDir = path.join(RESOURCES_DIR, "docs")
      await fs.mkdir(docsDir, { recursive: true })

      // Getting Started section
      const gettingStartedDir = path.join(docsDir, "getting-started")
      await fs.mkdir(gettingStartedDir, { recursive: true })

      await fs.writeFile(
        path.join(gettingStartedDir, "installation.md"),
        "# Installation\n\nFollow these steps to install the application:\n\n```bash\n# Clone the repository\ngit clone https://github.com/example/markdown-explorer.git\n\n# Navigate to the project directory\ncd markdown-explorer\n\n# Install dependencies\nnpm install\n\n# Start the development server\nnpm run dev\n```\n\nThe application will be available at `http://localhost:3000`.",
      )

      await fs.writeFile(
        path.join(gettingStartedDir, "configuration.md"),
        "# Configuration\n\n## Environment Variables\n\nCreate a `.env.local` file in the root of your project with the following variables:\n\n```\nNEXT_PUBLIC_APP_NAME=Markdown Explorer\n```\n\n## Custom Styling\n\nYou can customize the appearance of the application by modifying the `tailwind.config.js` file.",
      )

      // API Reference section
      const apiDir = path.join(docsDir, "api")
      await fs.mkdir(apiDir, { recursive: true })

      await fs.writeFile(
        path.join(apiDir, "overview.md"),
        "# API Overview\n\nThe application provides several API endpoints for retrieving file information and content.\n\n## Authentication\n\nAll API requests require authentication using an API key. Include the API key in the `Authorization` header of your requests:\n\n```\nAuthorization: Bearer YOUR_API_KEY\n```",
      )

      await fs.writeFile(
        path.join(apiDir, "endpoints.md"),
        '# API Endpoints\n\n## GET /api/files\n\nReturns the file structure.\n\n### Response\n\n```json\n{\n  "files": [\n    {\n      "id": "1",\n      "name": "docs",\n      "type": "folder",\n      "children": [...]\n    }\n  ]\n}\n```\n\n## GET /api/file?path=file-path\n\nReturns the content of a specific file.\n\n### Response\n\n```json\n{\n  "content": "# File Content\\n\\nThis is the content of the file."\n}\n```',
      )

      // Examples section
      const examplesDir = path.join(docsDir, "examples")
      await fs.mkdir(examplesDir, { recursive: true })

      await fs.writeFile(
        path.join(examplesDir, "basic-usage.md"),
        "# Basic Usage\n\n## Viewing Files\n\nTo view a file, simply click on it in the file explorer. The file content will be displayed in the main area.\n\n## Navigating Folders\n\nClick on a folder to expand or collapse it. You can navigate through the directory structure to find the files you want to view.",
      )

      await fs.writeFile(
        path.join(examplesDir, "advanced-features.md"),
        "# Advanced Features\n\n## Syntax Highlighting\n\nThe application supports syntax highlighting for code blocks. Simply use the standard markdown syntax for code blocks with a language identifier:\n\n````\n```javascript\nfunction hello() {\n  console.log('Hello, world!');\n}\n```\n````\n\n## Tables\n\nYou can create tables using the standard markdown syntax:\n\n```\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |\n```\n\nWhich will render as:\n\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |",
      )

      // Create a tutorials folder
      const tutorialsDir = path.join(RESOURCES_DIR, "tutorials")
      await fs.mkdir(tutorialsDir, { recursive: true })

      await fs.writeFile(
        path.join(tutorialsDir, "markdown-basics.md"),
        "# Markdown Basics\n\nMarkdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n## Basic Syntax\n\n### Headings\n\n```\n# Heading 1\n## Heading 2\n### Heading 3\n```\n\n### Emphasis\n\n```\n*italic*\n**bold**\n***bold and italic***\n```\n\n### Lists\n\n```\n- Item 1\n- Item 2\n  - Subitem 2.1\n  - Subitem 2.2\n\n1. First item\n2. Second item\n```\n\n### Links\n\n```\n[Link text](https://example.com)\n```\n\n### Images\n\n```\n![Alt text](image-url.jpg)\n```",
      )

      await fs.writeFile(
        path.join(tutorialsDir, "advanced-markdown.md"),
        "# Advanced Markdown\n\n## Code Blocks\n\nYou can create fenced code blocks by placing triple backticks ``` before and after the code block. Add a language identifier after the opening backticks for syntax highlighting.\n\n## Task Lists\n\n```\n- [x] Completed task\n- [ ] Incomplete task\n```\n\n## Tables\n\n```\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n```\n\n## Footnotes\n\n```\nHere's a sentence with a footnote. [^1]\n\n[^1]: This is the footnote.\n```\n\n## Strikethrough\n\n```\n~~Strikethrough text~~\n```",
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in GET /api/resources:", error)
    return NextResponse.json({ error: "Failed to create resources" }, { status: 500 })
  }
}

