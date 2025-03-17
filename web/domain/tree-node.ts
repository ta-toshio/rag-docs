
export interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
  isHybrid?: boolean; // ファイルとフォルダの両方の特性を持つノードを表す
}