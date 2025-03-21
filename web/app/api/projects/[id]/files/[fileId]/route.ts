import { NextResponse } from "next/server";
import { getFileTree, getTranslation } from "@/repository/db/sqlite-query";

export async function GET(
  req: Request,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const { fileId } = await params
    if (!fileId) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    const fileTree = await getFileTree(fileId);
    if (!fileTree) {
      return NextResponse.json({ error: "Target file not found" }, { status: 404 });
    }

    const translation = await getTranslation(fileTree.resource_id);
    if (!translation) {
      return NextResponse.json({ error: "Target translation data not found" }, { status: 404 });
    }

    return NextResponse.json({ ...translation }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/files/[fileId]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve file content" },
      { status: 500 }
    );
  }
}
