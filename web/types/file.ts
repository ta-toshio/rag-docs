export type FileType = {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  children?: FileType[]
}

