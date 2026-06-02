/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star } from 'lucide-react';
import React, { useState } from 'react';
import { formatBytes, formatFriendlyDate } from '../../lib/format';
import { FileItem } from '../../types';
import { FileActionsMenu } from './FileActionsMenu';
import { FileIcon } from './FileIcon';
import { FileContextMenu } from './FileContextMenu';

interface FileListProps {
  files: FileItem[];
  selectedId: string | null;
  onSelect: (file: FileItem) => void;
  onDoubleClick: (file: FileItem) => void;
  onContextMenuSelect?: (file: FileItem) => void;
  
  onPreview: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRestore?: (file: FileItem) => void;
  onStar: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onCopy?: (file: FileItem) => void;
  onCut?: (file: FileItem) => void;
  onPasteSpecial?: (file: FileItem) => void;
  onOpenDetail?: (file: FileItem) => void;
  canPaste?: boolean;
  
  isTrashView?: boolean;
}

export function FileList({
  files,
  selectedId,
  onSelect,
  onDoubleClick,
  onContextMenuSelect,
  onPreview,
  onShare,
  onRename,
  onDelete,
  onRestore,
  onStar,
  onDownload,
  onCopy,
  onCut,
  onPasteSpecial,
  onOpenDetail,
  canPaste = false,
  isTrashView = false,
}: FileListProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);

  if (files.length === 0) return null;

  const handleRowContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    // Select the file if not already selected
    if (selectedId !== file.id) {
      if (onContextMenuSelect) {
        onContextMenuSelect(file);
      } else {
        onSelect(file);
      }
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file,
    });
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden select-none shadow-3xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="py-3.5 px-5">名称</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">类型</th>
              <th className="py-3.5 px-4 hidden md:table-cell">大小</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">更新时间</th>
              <th className="py-3.5 px-5 text-right w-16">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 divide-dashed">
            {files.map((file) => {
              const isSelected = selectedId === file.id;
              return (
                <tr
                  key={file.id}
                  onClick={() => onSelect(file)}
                  onDoubleClick={() => onDoubleClick(file)}
                  onContextMenu={(e) => handleRowContextMenu(e, file)}
                  className={`group relative text-slate-800 hover:bg-slate-50/80 cursor-pointer transition-colors text-sm ${
                    isSelected ? 'bg-blue-50/40 hover:bg-blue-50/50' : ''
                  }`}
                  id={`file-row-${file.id}`}
                >
                  {/* Name column */}
                  <td className="py-3 px-5 py-3.5 font-medium min-w-0 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 transition-transform group-hover:scale-105">
                        <FileIcon type={file.type} size={18} />
                      </div>
                      <span className="truncate text-slate-900 font-semibold" title={file.name}>
                        {file.name}
                      </span>
                      {file.isStarred && !isTrashView && (
                        <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>
                  </td>

                  {/* Type column */}
                  <td className="py-3 px-4 hidden sm:table-cell text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {file.type === 'folder' ? '文件夹' : file.extension || '文件'}
                  </td>

                  {/* Size column */}
                  <td className="py-3 px-4 hidden md:table-cell text-xs font-mono font-medium text-slate-500">
                    {file.type === 'folder' ? '--' : formatBytes(file.size)}
                  </td>

                  {/* Time column */}
                  <td className="py-3 px-4 hidden sm:table-cell text-xs text-slate-500">
                    {formatFriendlyDate(file.updatedAt)}
                  </td>

                  {/* Actions dots dropdown */}
                  <td className="py-3 px-5 text-right">
                    <FileActionsMenu
                      file={file}
                      onPreview={() => onPreview(file)}
                      onShare={() => onShare(file)}
                      onRename={() => onRename(file)}
                      onDelete={() => onDelete(file)}
                      onRestore={onRestore ? () => onRestore(file) : undefined}
                      onStar={() => onStar(file)}
                      onDownload={() => onDownload(file)}
                      onCopy={onCopy ? () => onCopy(file) : undefined}
                      onCut={onCut ? () => onCut(file) : undefined}
                      onPasteSpecial={onPasteSpecial ? () => onPasteSpecial(file) : undefined}
                      onOpenDetail={onOpenDetail ? () => onOpenDetail(file) : undefined}
                      canPaste={canPaste}
                      isTrashView={isTrashView}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onPreview={() => onPreview(contextMenu.file)}
          onShare={() => onShare(contextMenu.file)}
          onRename={() => onRename(contextMenu.file)}
          onDelete={() => onDelete(contextMenu.file)}
          onRestore={onRestore ? () => onRestore?.(contextMenu.file) : undefined}
          onStar={() => onStar(contextMenu.file)}
          onDownload={() => onDownload(contextMenu.file)}
          onCopy={onCopy ? () => onCopy(contextMenu.file) : undefined}
          onCut={onCut ? () => onCut(contextMenu.file) : undefined}
          onPasteSpecial={onPasteSpecial ? () => onPasteSpecial(contextMenu.file) : undefined}
          onOpenDetail={onOpenDetail ? () => onOpenDetail(contextMenu.file) : undefined}
          canPaste={canPaste}
          isTrashView={isTrashView}
        />
      )}
    </div>
  );
}
