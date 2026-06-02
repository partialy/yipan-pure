/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { formatBytes } from '../../lib/format';
import { FileItem } from '../../types';
import { FileActionsMenu } from './FileActionsMenu';
import { FileIcon } from './FileIcon';
import { FileContextMenu } from './FileContextMenu';

interface FileGridProps {
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

export function FileGrid({
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
}: FileGridProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);

  if (files.length === 0) return null;

  // Stagger entry configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 220 } },
  };

  const handleCardContextMenu = (e: React.MouseEvent, file: FileItem) => {
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
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {files.map((file) => {
          const isSelected = selectedId === file.id;

          return (
            <motion.div
              variants={itemVariants}
              key={file.id}
              onClick={() => onSelect(file)}
              onDoubleClick={() => onDoubleClick(file)}
              onContextMenu={(e) => handleCardContextMenu(e, file)}
              className={`p-4 bg-white border rounded-xl hover:border-blue-400 cursor-pointer group transition-all select-none relative flex flex-col justify-between shadow-3xs hover:shadow-2xs ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/20'
                  : 'border-slate-200'
              }`}
              id={`file-card-${file.id}`}
            >
              {/* Top row actions */}
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                  <FileIcon type={file.type} size={20} />
                </div>

                <div className="flex items-center gap-1.5 justify-center">
                  {file.isStarred && !isTrashView && (
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                  )}
                  
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
                </div>
              </div>

              {/* Title / meta details */}
              <div className="pt-2">
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate text-sm" title={file.name}>
                  {file.name}
                </h3>
                
                <p className="text-xs text-slate-400 mt-1 font-semibold tracking-wide flex items-center gap-1">
                  {file.type === 'folder' ? (
                    <span>文件夹</span>
                  ) : (
                    <>
                      <span className="uppercase font-mono">{file.extension || 'file'}</span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

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
    </>
  );
}
