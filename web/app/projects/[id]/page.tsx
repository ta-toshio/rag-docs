import type React from "react"
import ProjectPageComponent from "@/components/page/project-page"
import { getFiles } from "@/server-actions/repository"
import { buildTree } from "@/domain/build-tree"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const files = buildTree(await getFiles(id) || [])

  return <ProjectPageComponent projectId={id} files={files} />
}

