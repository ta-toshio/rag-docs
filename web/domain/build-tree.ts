import { FileTreeEntry } from "./file-tree";
import { TreeNode } from "./tree-node";

// ファイルとフォルダの両方の特性を持つノードのための型
export interface HybridNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  isHybrid?: boolean; // ファイルとフォルダの両方の特性を持つノードを表す
}

export function buildTree(files: FileTreeEntry[]): TreeNode[] {
  // パスをキーに各ノードを管理するマップ
  const nodeMap: Map<string, TreeNode> = new Map();
  // ルート（親を持たない）ノードの配列
  const roots: TreeNode[] = [];

  for (const file of files) {
    // 特殊ケース：パスが "/" の場合
    if (file.path === "/") {
      const node: TreeNode = {
        id: file.id,
        name: file.name,
        path: file.path,
        type: "file"
      };
      nodeMap.set(file.path, node);
      roots.push(node);
      continue;
    }

    // ファイルパスを "/" で分割し、空文字を除去
    const segments = file.path.split('/').filter(Boolean);
    let currentPath = "";
    let parent: TreeNode | undefined = undefined;

    // 各セグメントごとにツリーに追加（途中はフォルダ、最終はファイル）
    segments.forEach((segment, index) => {
      currentPath += "/" + segment;
      let currentNode = nodeMap.get(currentPath);
      
      if (!currentNode) {
        if (index === segments.length - 1) {
          // 最終セグメントはファイルノード
          currentNode = {
            id: file.id,
            name: file.name,
            path: currentPath,
            type: "file",
          };
        } else {
          // 中間セグメントはフォルダノード（自前作成）
          currentNode = {
            id: `folder-${currentPath}`,
            name: segment,
            path: currentPath,
            type: "folder",
            children: [],
          };
        }
        nodeMap.set(currentPath, currentNode);
        // 親ノードがあればその children に追加、なければルートに追加
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(currentNode);
        } else {
          roots.push(currentNode);
        }
      } else if (index === segments.length - 1) {
        // 既存のノードが見つかり、かつ最終セグメントの場合
        // ファイルの情報で更新
        currentNode.id = file.id;
        currentNode.name = file.name;
        // 既存のノードがフォルダだった場合、ハイブリッドノードにする
        if (currentNode.type === "folder") {
          currentNode.isHybrid = true;
          // type は "folder" のままにして、children を保持
        } else {
          currentNode.type = "file";
        }
      } else if (currentNode.type === "file") {
        // 既存のノードがファイルで、中間セグメントの場合
        // フォルダとしての特性を追加
        currentNode.isHybrid = true;
        currentNode.children = currentNode.children || [];
      }
      parent = currentNode;
    });
  }

  return roots;
}


export function flattenTree(nodes: TreeNode[]): HybridNode[] {
  let flatList: HybridNode[] = [];

  for (const node of nodes) {
    // 現在のノードを追加
    flatList.push(node);
    // 子ノードがあれば再帰的に処理して連結
    if (node.children && node.children.length > 0) {
      flatList = flatList.concat(flattenTree(node.children));
    }
  }

  return flatList;
}
