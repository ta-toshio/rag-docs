# 検索機能の修正計画

## 現状の問題点

現在の`searchDocuments`関数は`SearchResult`型を返していますが、ユーザーからのフィードバックに基づいて、`TreeNode`を拡張した型を返すように修正する必要があります。また、検索結果に`hitText`フィールドを追加し、Qdrantの`vector_collection`から取得した`original_text`の値を格納する必要があります。

## 修正計画

### 1. 新しい型の定義

`TreeNode`を拡張した新しい型`SearchTreeNode`を定義します：

```typescript
import { TreeNode } from "@/domain/tree-node";

export interface SearchTreeNode extends TreeNode {
  hitText: string;  // vector_collectionのoriginal_textの値
  score: number;    // 検索結果のスコア
}
```

### 2. `searchDocuments`関数の修正

`searchDocuments`関数の返り値の型を`SearchTreeNode[]`に変更し、検索結果を整形する部分を修正します。`domain/build-tree.ts`の関数を参考にして、FileTreeEntryからTreeNodeへの変換を行います：

```typescript
import { TreeNode } from "@/domain/tree-node";

export interface SearchTreeNode extends TreeNode {
  hitText: string;
  score: number;
}

export async function searchDocuments(formData: FormData): Promise<SearchTreeNode[]> {
  // ...既存のコード...

  // 6. 検索結果を整形
  const results: SearchTreeNode[] = searchResults.map((result, index) => {
    const fileTree = fileTrees[index];
    const translation = translations[index];
    
    if (!fileTree || !translation) {
      return null;
    }

    // FileTreeEntryからTreeNodeへの変換（build-tree.tsを参考に）
    const searchNode: SearchTreeNode = {
      id: fileTree.id,
      name: fileTree.name,
      path: fileTree.path,
      type: fileTree.type,
      hitText: result.payload?.original_text as string || "",
      score: result.score,
    };

    return searchNode;
  }).filter(Boolean) as SearchTreeNode[];

  // ...既存のコード...
}
```

### 3. `search-dialog.tsx`の修正

`search-dialog.tsx`も修正して、新しい型に対応させる必要があります：

```typescript
import { SearchTreeNode } from "@/server-actions/search";

// ...

// ResultItemPropsの型を更新
interface ResultItemProps {
  item: SearchTreeNode;
  searchQuery: string;
  level?: number;
}

function ResultItem({ item, searchQuery, level = 0 }: ResultItemProps) {
  // ...

  return (
    <>
      <button
        // ...
      >
        <div className="flex flex-1 items-center gap-2">
          {/* ... */}
          <div className="flex flex-col text-left">
            <div className="font-medium">{highlightText(item.name)}</div>
            <div className="text-xs text-muted-foreground">{item.path}</div>
            {item.hitText && (
              <div className="text-xs text-muted-foreground mt-1">{highlightText(item.hitText)}</div>
            )}
            {item.score !== undefined && (
              <div className="text-xs text-muted-foreground mt-1">スコア: {item.score.toFixed(2)}</div>
            )}
          </div>
        </div>
        {/* ... */}
      </button>
      {/* ... */}
    </>
  );
}
```

## 実装手順

1. Codeモードに切り替える
2. `server-actions/search.ts`を修正して新しい型を定義し、関数の返り値を変更する
3. `components/search-dialog.tsx`を修正して新しい型に対応させる
4. 動作確認を行う