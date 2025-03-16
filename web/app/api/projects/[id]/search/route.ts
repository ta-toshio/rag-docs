import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const results = await searchFiles(projectId, query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error in GET /api/projects/[id]/search:", error);
    return NextResponse.json(
      { error: "Failed to perform file search" },
      { status: 500 }
    );
  }
}

async function searchFiles(projectId: string, query: string) {
  // TODO: データベースからファイル検索を行う処理を実装する
  return [];
}