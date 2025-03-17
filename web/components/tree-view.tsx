"use client";

import * as React from "react";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import { ChevronRight, File, Folder, FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import useLocalStorage from "@/hooks/use-local-storage";
import { TreeNode } from "@/domain/tree-node";

export interface TreeViewHandle {
  expandFolders: (folderIds: string[]) => void;
}

interface TreeViewProps {
  fileList: TreeNode[];
  onFileSelect?: (file: TreeNode) => void;
  activeFileId?: string | null;
}

export const TreeView = forwardRef<TreeViewHandle, TreeViewProps>(
  ({ fileList, onFileSelect, activeFileId }, ref) => {
    // State for expanded folders
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

    const toggleFolder = (folderId: string) => {
    const newExpanded = [...expandedFolders];
    if (newExpanded.includes(folderId)) {
      newExpanded.splice(newExpanded.indexOf(folderId), 1);
    } else {
      newExpanded.push(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const isExpanded = (folderId: string) => {
    return expandedFolders.includes(folderId);
  };

  interface TreeViewItemProps {
    item: TreeNode;
    level?: number;
  }

  function TreeViewItem({ item, level = 0 }: TreeViewItemProps) {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedFolders.includes(item.id);
    const isMarkdown = item.name.endsWith(".md");
    const isActive = activeFileId === item.id;

    const handleClick = () => {
      if (hasChildren || item.isHybrid) {
        // フォルダまたはハイブリッドノードの場合は展開/折りたたみ
        toggleFolder(item.id);
        
        // ハイブリッドノードの場合は、ファイルとしても選択
        if (item.isHybrid && onFileSelect) {
          onFileSelect(item);
        }
      } else if (onFileSelect) {
        // 通常のファイルの場合は選択のみ
        onFileSelect(item);
      }
    };

    return (
      <div>
        <button
          onClick={handleClick}
          className={cn(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent",
            "focus:bg-accent focus:outline-none",
            isActive && "bg-accent text-accent-foreground font-medium"
          )}
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
        >
          {hasChildren ? (
            <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-90")} />
          ) : (
            <span className="w-4" />
          )}
          {item.isHybrid ? (
            // ハイブリッドノード（ファイルとフォルダの両方）
            <div className="relative">
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-blue-500" />
              )}
              <File className="h-3 w-3 shrink-0 text-gray-500 absolute -bottom-1 -right-1" />
            </div>
          ) : item.type === "folder" ? (
            // 通常のフォルダ
            isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-blue-500" />
            )
          ) : isMarkdown ? (
            // Markdownファイル
            <FileText className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            // その他のファイル
            <File className="h-4 w-4 shrink-0 text-gray-500" />
          )}
          <span className="truncate">{item.name}</span>
        </button>
        {hasChildren && isExpanded && item.children && (
          <div>
            {item.children.map((child) => (
              <TreeViewItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="mb-2 px-2 py-1 text-sm font-medium text-muted-foreground">Files</div>
      {fileList.map((file) => (
        <TreeViewItem key={file.id} item={file} />
      ))}
    </div>
  );
});
