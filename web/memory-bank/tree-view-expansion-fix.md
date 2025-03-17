# ファイルツリー展開の問題解決策

検索結果からファイルを選択したときに、ファイルは開かれるものの、ファイルツリーが展開されない問題が発生しています。これは、ProjectPage コンポーネントと TreeView コンポーネントで別々の expandedFolders 状態を管理しているためです。

## 解決策: TreeView の機能を外部から参照できるようにする

1. TreeView コンポーネントに ref を追加して、expandedFolders と展開機能を外部から参照できるようにする
2. ProjectPage から TreeView の展開機能を呼び出す

### 実装手順

1. **TreeView コンポーネントの修正**:
   - useImperativeHandle を使用して、expandFolders 関数を外部に公開する
   - この関数は、指定されたフォルダIDのリストを展開する

```tsx
// components/tree-view.tsx
import React, { forwardRef, useImperativeHandle } from "react";

export interface TreeViewHandle {
  expandFolders: (folderIds: string[]) => void;
}

export const TreeView = forwardRef<TreeViewHandle, TreeViewProps>(
  ({ fileList, onFileSelect, activeFileId }, ref) => {
    const [expandedFolders, setExpandedFolders] = useLocalStorage<string[]>(
      "expandedFolders",
      []
    );

    // 外部から呼び出せる関数を定義
    useImperativeHandle(ref, () => ({
      expandFolders: (folderIds: string[]) => {
        const newExpandedFolders = [...expandedFolders];
        folderIds.forEach(folderId => {
          if (!newExpandedFolders.includes(folderId)) {
            newExpandedFolders.push(folderId);
          }
        });
        setExpandedFolders(newExpandedFolders);
      }
    }));

    // 既存のコード...
  }
);
```

2. **ProjectPage コンポーネントの修正**:
   - TreeView への ref を作成
   - expandPathInTree 関数を修正して、TreeView の expandFolders 関数を呼び出す

```tsx
// components/page/project-page.tsx
const treeViewRef = useRef<TreeViewHandle>(null);

// パスに基づいてフォルダを展開する
const expandPathInTree = (path: string) => {
  const parts = path.split('/');
  let currentPath = '';
  const folderIds: string[] = [];
  
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i]) {
      currentPath += (currentPath ? '/' : '') + parts[i];
      
      // このパスに対応するフォルダノードを探す
      const findFolderByPath = (nodes: TreeNode[], path: string): string | null => {
        for (const node of nodes) {
          if (node.type === 'folder' && node.path === path) {
            return node.id;
          }
          if (node.children) {
            const found = findFolderByPath(node.children, path);
            if (found) {
              return found;
            }
          }
        }
        return null;
      };
      
      const folderId = findFolderByPath(files, currentPath);
      if (folderId) {
        folderIds.push(folderId);
      }
    }
  }
  
  // TreeView の expandFolders 関数を呼び出す
  if (treeViewRef.current && folderIds.length > 0) {
    treeViewRef.current.expandFolders(folderIds);
  }
};

// TreeView コンポーネントに ref を渡す
<TreeView 
  ref={treeViewRef}
  fileList={files} 
  onFileSelect={handleFileSelect} 
  activeFileId={activeFileId} 
/>
```

この実装により、TreeView コンポーネントが引き続き expandedFolders の主要な管理者となりつつ、ProjectPage からも必要に応じて制御できるようになります。