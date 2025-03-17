import type React from "react"
import ProjectPageComponent from "@/components/page/project-page"
import { getFiles } from "@/server-actions/repository"
import { buildTree, flattenTree } from "@/domain/build-tree"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const files = buildTree(await getFiles(id) || [])
  const flatFiles = flattenTree(files)

  return <ProjectPageComponent projectId={id} files={files} flatFiles={flatFiles} />
}

