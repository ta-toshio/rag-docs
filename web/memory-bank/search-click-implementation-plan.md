# 検索結果アイテムクリック時の実装計画

## 現状の理解

1. **検索機能**:
   - SearchDialog コンポーネントで検索結果を表示
   - 検索結果は SearchResult 型で、id, name, path, hitText, score を含む
   - 現在、検索結果アイテムをクリックしたときの動作は実装されていない

2. **ファイルツリー**:
   - TreeView コンポーネントでファイルツリーを表示
   - ファイルをクリックすると onFileSelect コールバックが呼び出される
   - フォルダの展開状態は expandedFolders で管理され、LocalStorage に保存

3. **プロジェクトページ**:
   - ProjectPage コンポーネントがファイルツリーとメインコンテンツエリアを管理
   - handleFileSelect 関数でファイルの内容を取得してメインエリアに表示
   - ファイルの開閉状態は openFiles と activeFileId で管理

## 実装計画

検索結果アイテムをクリックしたときに、ファイルツリーを開いて該当のファイルを表示する機能を実装するために、以下の変更が必要です：

1. **SearchDialog コンポーネントの修正**:
   - ResultItem コンポーネントにクリックハンドラを追加
   - クリックされたアイテムの情報を親コンポーネントに伝える

2. **SearchBar コンポーネントの修正**:
   - SearchDialog からファイル選択イベントを受け取る
   - 選択されたファイルの情報をプロジェクトページに伝える

3. **ProjectPage コンポーネントの修正**:
   - SearchBar からファイル選択イベントを受け取る
   - 選択されたファイルに対して handleFileSelect を呼び出す
   - 必要に応じてファイルツリーのフォルダを展開する

## 詳細な実装手順

### 1. SearchDialog コンポーネントの修正

```tsx
// components/search-dialog.tsx
interface SearchDialogProps {
  // 既存のプロパティ
  onFileSelect?: (file: SearchResult) => void; // 新しいプロパティ
}

function ResultItem({ item, searchQuery, level = 0, onFileSelect }: ResultItemProps) {
  // 既存のコード

  const handleClick = () => {
    if (onFileSelect) {
      onFileSelect(item);
    }
  };

  return (
    <>
      <div 
        className="flex flex-1 items-center gap-2 mb-4 cursor-pointer hover:bg-accent/50 p-2 rounded"
        onClick={handleClick}
      >
        {/* 既存のコード */}
      </div>
    </>
  );
}
```

### 2. SearchBar コンポーネントの修正

```tsx
// components/search-bar.tsx
interface SearchBarProps {
  onFileSelect?: (file: SearchResult) => void;
}

export function SearchBar({ onFileSelect }: SearchBarProps) {
  // 既存のコード

  const handleFileSelect = (file: SearchResult) => {
    if (onFileSelect) {
      onFileSelect(file);
      setOpen(false); // 検索ダイアログを閉じる
    }
  };

  return (
    <>
      {/* 既存のコード */}
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        projectId={projectId}
        onFileSelect={handleFileSelect} // 新しいプロパティ
      />
    </>
  );
}
```

### 3. ProjectPage コンポーネントの修正

```tsx
// components/page/project-page.tsx
export default function ProjectPage({ projectId, files }: { projectId: string, files: TreeNode[] }) {
  // 既存のコード
  const [expandedFolders, setExpandedFolders] = useLocalStorage<string[]>(
    "expandedFolders",
    []
  );

  // 検索結果からファイルを選択したときの処理
  const handleSearchFileSelect = (searchResult: SearchResult) => {
    // ファイルツリーから対応するノードを探す
    const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        if (node.children) {
          const found = findNodeById(node.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const node = findNodeById(files, searchResult.id);
    if (node) {
      // パスからフォルダを展開
      expandPathInTree(node.path);
      // ファイルを選択
      handleFileSelect(node);
    }
  };

  // パスに基づいてフォルダを展開する
  const expandPathInTree = (path: string) => {
    const parts = path.split('/');
    let currentPath = '';
    
    // パスの各部分に対応するフォルダIDを特定して展開
    const newExpandedFolders = [...expandedFolders];
    
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
        if (folderId && !newExpandedFolders.includes(folderId)) {
          newExpandedFolders.push(folderId);
        }
      }
    }
    
    setExpandedFolders(newExpandedFolders);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center">
          <ProjectSelector projectId={projectId} />
        </div>
        <SearchBar onFileSelect={handleSearchFileSelect} />
        {/* 既存のコード */}
      </header>
      {/* 既存のコード */}
    </div>
  );
}
```

## 実装上の注意点

1. **型の互換性**:
   - SearchResult と TreeNode は異なる型ですが、id, name, path などの共通プロパティがあります
   - 必要に応じて型変換や型アサーションを行う必要があります

2. **パスの解析**:
   - ファイルパスを解析してフォルダ構造を特定する処理は複雑になる可能性があります
   - エッジケース（空のパス、特殊文字を含むパスなど）に注意する必要があります

3. **パフォーマンス**:
   - 大きなファイルツリーの場合、ノードを検索する処理が重くなる可能性があります
   - 必要に応じてキャッシュやメモ化を検討する必要があります

## データフロー図

```mermaid
sequenceDiagram
    participant User
    participant SearchDialog
    participant SearchBar
    participant ProjectPage
    participant TreeView
    participant API

    User->>SearchDialog: クリック検索結果アイテム
    SearchDialog->>SearchBar: onFileSelect(searchResult)
    SearchBar->>ProjectPage: handleSearchFileSelect(searchResult)
    ProjectPage->>ProjectPage: expandPathInTree(path)
    ProjectPage->>ProjectPage: handleFileSelect(node)
    ProjectPage->>API: fetch file content
    API-->>ProjectPage: file content
    ProjectPage->>TreeView: update expandedFolders
    ProjectPage->>ProjectPage: update openFiles & activeFileId