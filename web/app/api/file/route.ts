import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

// Base directory for resource files
const RESOURCES_DIR = path.join(process.cwd(), "resources")
console.log("RESOURCES_DIR:", RESOURCES_DIR)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")

    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    // Resolve the full path, ensuring we stay within the resources directory
    const fullPath = path.join(RESOURCES_DIR, filePath)

    // Security check - make sure the path is within the resources directory
    const relativePath = path.relative(RESOURCES_DIR, fullPath)
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 })
    }

    // Read the file content
    const content = await fs.readFile(fullPath, "utf-8")

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error reading file:", error)

    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json({ error: "Failed to read file" }, { status: 500 })
  }
}

