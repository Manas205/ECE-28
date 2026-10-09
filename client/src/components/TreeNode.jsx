import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";

const fileIcons = {
  image: ImageIcon,
  video: Video,
  document: FileText,
  file: FileIcon,
};

export default function TreeNode({ item, depth = 0, selectedId, onSelect }) {
  const [open, setOpen] = useState(depth === 0);
  const isFolder = item.type === "folder";
  const Icon = isFolder ? (open ? FolderOpen : Folder) : fileIcons[item.type] || FileIcon;
  const isSelected = selectedId === item.id;

  return (
    <div>
      <button
        onClick={() => (isFolder ? setOpen(!open) : onSelect(item))}
        style={{ paddingLeft: depth * 16 + 8 }}
        className={`flex w-full items-center gap-2 rounded-md py-2 pr-2 text-left text-sm hover:bg-gray-100 ${
          isSelected ? "bg-blue-50 text-blue-700" : "text-gray-800"
        }`}
      >
        {isFolder ? (
          open ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        ) : (
          <span className="w-4" />
        )}
        <Icon size={18} className={isFolder ? "text-blue-500" : "text-gray-500"} />
        <span className="flex-1 truncate">{item.name}</span>
        {!isFolder && item.size && (
          <span className="shrink-0 text-xs text-gray-400">{item.size}</span>
        )}
      </button>

      {isFolder &&
        open &&
        item.children.map((child) => (
          <TreeNode
            key={child.id}
            item={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}