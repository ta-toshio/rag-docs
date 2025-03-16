import { NextResponse } from "next/server";
import db from "@/lib/db";
import { ProjectEntry } from "@/domain/project";

export async function GET() {
  try {
    const stmt = db.prepare('SELECT id, value FROM projects');
    const rows = stmt.all() as ProjectEntry[];

    const projects = rows.map((row) => ({
      id: row.id,
      value: row.value,
    }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    return NextResponse.json(
      { error: "Failed to retrieve project list" },
      { status: 500 }
    );
  }
}