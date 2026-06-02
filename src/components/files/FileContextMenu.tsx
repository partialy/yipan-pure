/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Share2, Edit2, Star, Trash2, Eye, Download, Undo, Copy, Scissors, Clipboard, Info } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileItem } from '../../types';

interface FileContextMenuProps {
  file: FileItem;
  x: number;
  y: number;
  onClose: () => void;
  onPreview: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onStar: () => void;
  onDownload: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPasteSpecial?: () => void; // Paste into this specific folder
  onOpenDetail?: () => void;
  canPaste?: boolean;
  isTrashView?: boolean;
}

export function FileContextMenu({
  file,
  x,
  y,
  onClose,
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
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ x, y });

  useEffect(() => {
    // Determine adjusted position to prevent menu going off-screen
    const menuWidth = 176;
    const estimatedHeight = isTrashView ? 100 : 340;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Open leftwards if too close to right edge
    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10;
    }
    // Open upwards if too close to bottom edge
    if (y + estimatedHeight > viewportHeight) {
      adjustedY = viewportHeight - estimatedHeight - 10;
    }

    if (adjustedX < 10) adjustedX = 10;
    if (adjustedY < 10) adjustedY = 10;

    setAdjustedPos({ x: adjustedX, y: adjustedY });
  }, [x, y, isTrashView, canPaste]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    // Listen to click and mousedown
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', onClose, { capture: true, passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', onClose, { capture: true });
    };
  }, [onClose]);

  const handleAction = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    callback();
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${adjustedPos.x}px`,
        top: `${adjustedPos.y}px`,
        width: '176px',
      }}
      className="rounded-xl border border-slate-200 bg-white shadow-lg z-[9999] py-1.5 animate-fadeIn text-left"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {isTrashView ? (
        <>
          {onRestore && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onRestore)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`context-restore-${file.id}`}
            >
              <Undo size={14} className="text-emerald-500" /> 恢复该文件
            </button>
          )}
          <button
            type="button"
            onClick={(e) => handleAction(e, onDelete)}
            className="w-full px-4 py-2 text-xs font-semibold hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
            id={`context-delete-permanent-${file.id}`}
          >
            <Trash2 size={14} /> 彻底物理删除
          </button>
        </>
      ) : (
        <>
          {/* 预览 */}
          {file.type !== 'folder' && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onPreview)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`context-preview-${file.id}`}
            >
              <Eye size={14} className="text-slate-400" /> 在线快速预览
            </button>
          )}

          {/* 生成分享链接 */}
          <button
            type="button"
            onClick={(e) => handleAction(e, onShare)}
            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
            id={`context-share-${file.id}`}
          >
            <Share2 size={14} className="text-slate-400" /> 生成分享链接
          </button>

          {/* 详细信息 */}
          {onOpenDetail && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onOpenDetail)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`context-detail-${file.id}`}
            >
              <Info size={14} className="text-slate-400" /> 查看详细属性
            </button>
          )}

          {/* 收藏 */}
          <button
            type="button"
            onClick={(e) => handleAction(e, onStar)}
            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
            id={`context-star-${file.id}`}
          >
            <Star
              size={14}
              className={file.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}
            />{' '}
            {file.isStarred ? '取消我的收藏' : '移入星标收藏'}
          </button>

          {/* 重命名 */}
          <button
            type="button"
            onClick={(e) => handleAction(e, onRename)}
            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
            id={`context-rename-${file.id}`}
          >
            <Edit2 size={14} className="text-slate-400" /> 重命名
          </button>

          {/* 直接下载 */}
          {file.type !== 'folder' && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onDownload)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`context-download-${file.id}`}
            >
              <Download size={14} className="text-slate-400" /> 直接下载
            </button>
          )}

          <hr className="my-1 border-slate-100" />

          {/* 复制 */}
          {onCopy && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onCopy)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`context-copy-${file.id}`}
            >
              <Copy size={14} className="text-slate-400" /> 复制
            </button>
          )}

          {/* 剪切 */}
          {onCut && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onCut)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`context-cut-${file.id}`}
            >
              <Scissors size={14} className="text-slate-400" /> 移动 / 剪切
            </button>
          )}

          {/* 粘贴至此文件夹 */}
          {file.type === 'folder' && canPaste && onPasteSpecial && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onPasteSpecial)}
              className="w-full px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer"
              id={`context-paste-special-${file.id}`}
            >
              <Clipboard size={14} className="text-emerald-500 animate-pulse" /> 粘贴至此文件夹
            </button>
          )}

          <hr className="my-1 border-slate-100" />

          {/* 软删除 */}
          <button
            type="button"
            onClick={(e) => handleAction(e, onDelete)}
            className="w-full px-4 py-2 text-xs font-semibold hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
            id={`context-delete-${file.id}`}
          >
            <Trash2 size={14} /> 移入回收站
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
