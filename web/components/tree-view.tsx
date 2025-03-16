"use client";

import * as React from "react";
import { ChevronRight, File, Folder, FolderOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import useLocalStorage from "@/hooks/use-local-storage";
import { TreeNode } from "@/domain/tree-node";

interface TreeViewProps {
  fileList: TreeNode[];
  onFileSelect?: (file: TreeNode) => void;
  activeFileId?: string | null;
}

export function TreeView({ fileList, onFileSelect, activeFileId }: TreeViewProps) {
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = useLocalStorage<string[]>(
    "expandedFolders",
    []
  );

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
      if (hasChildren) {
        toggleFolder(item.id);
      } else if (onFileSelect) {
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
          {item.type === "folder" ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-blue-500" />
            )
          ) : isMarkdown ? (
            <FileText className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
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
}
