import { NextResponse } from "next/server";
import { getFiles } from "@/repository/db/sqlite-query";
import { buildTree } from "@/domain/build-tree";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = id
    if (!projectId) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    const files = await getFiles(projectId);
    const tree = buildTree(files);

    return NextResponse.json({ files: tree }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/files:", error);
    return NextResponse.json({ error: "Failed to retrieve file structure" }, { status: 500 });
  }
}

