/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoreVertical, Share2, Edit2, Star, Trash2, Eye, Download, Undo, Copy, Scissors, Clipboard, Info } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileItem } from '../../types';

interface FileActionsMenuProps {
  file: FileItem;
  onPreview: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onStar: () => void;
  onDownload: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPasteSpecial?: () => void;
  onOpenDetail?: () => void;
  canPaste?: boolean;
  isTrashView?: boolean;
}

export function FileActionsMenu({
  file,
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
}: FileActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Measure button position relative to viewport when open
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current!.getBoundingClientRect();
        const menuWidth = 176;
        const estimatedHeight = isTrashView ? 100 : 340;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = rect.right - menuWidth;
        let top = rect.bottom + 4;

        // If it goes beyond viewport bottom, position it above the button
        if (rect.bottom + estimatedHeight > viewportHeight) {
          top = rect.top - estimatedHeight - 4;
        }

        if (top < 10) {
          top = rect.bottom + 4;
        }
        if (left < 10) {
          left = 10;
        }
        if (left + menuWidth > viewportWidth) {
          left = viewportWidth - menuWidth - 10;
        }

        setCoords({ top, left });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, isTrashView]);

  // Handle click outside to close
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      // If clicked inside either the trigger button or the portal menu, do not close here
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuContainerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', clickOutside);
      // Close on scroll so it doesn't drift
      window.addEventListener('scroll', () => setIsOpen(false), { capture: true, passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', clickOutside);
      window.removeEventListener('scroll', () => setIsOpen(false), { capture: true });
    };
  }, [isOpen]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection or folder click
    setIsOpen(!isOpen);
  };

  const handleAction = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    callback();
  };

  const menuContent = isOpen && coords ? (
    <div
      ref={menuContainerRef}
      style={{
        position: 'fixed',
        left: `${coords.left}px`,
        top: `${coords.top}px`,
        width: '176px',
      }}
      className="rounded-xl border border-slate-200 bg-white shadow-lg z-[9999] py-1.5 animate-fadeIn text-left"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 回收站单独菜单 */}
      {isTrashView ? (
        <>
          {onRestore && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onRestore)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`action-restore-${file.id}`}
            >
              <Undo size={14} className="text-emerald-500" /> 恢复该文件
            </button>
          )}
          <button
            type="button"
            onClick={(e) => handleAction(e, onDelete)}
            className="w-full px-4 py-2 text-xs font-semibold hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
            id={`action-delete-permanent-${file.id}`}
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
              id={`action-preview-${file.id}`}
            >
              <Eye size={14} className="text-slate-400" /> 在线快速预览
            </button>
          )}

          {/* 分享 */}
          <button
            type="button"
            onClick={(e) => handleAction(e, onShare)}
            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
            id={`action-share-${file.id}`}
          >
            <Share2 size={14} className="text-slate-400" /> 生成分享链接
          </button>

          {/* 详细信息 */}
          {onOpenDetail && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onOpenDetail)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`action-detail-${file.id}`}
            >
              <Info size={14} className="text-slate-400" /> 查看详细属性
            </button>
          )}

          {/* 收藏 */}
          <button
            type="button"
            onClick={(e) => handleAction(e, onStar)}
            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
            id={`action-star-${file.id}`}
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
            id={`action-rename-${file.id}`}
          >
            <Edit2 size={14} className="text-slate-400" /> 重命名
          </button>

          {/* 下载 */}
          {file.type !== 'folder' && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onDownload)}
              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              id={`action-download-${file.id}`}
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
              id={`action-copy-${file.id}`}
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
              id={`action-cut-${file.id}`}
            >
              <Scissors size={14} className="text-slate-400" /> 移动 / 剪切
            </button>
          )}

          {/* 粘贴至文件夹 */}
          {file.type === 'folder' && canPaste && onPasteSpecial && (
            <button
              type="button"
              onClick={(e) => handleAction(e, onPasteSpecial)}
              className="w-full px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer"
              id={`action-paste-special-${file.id}`}
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
            id={`action-delete-${file.id}`}
          >
            <Trash2 size={14} /> 移入回收站
          </button>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer justify-center items-center flex"
        title="文件管理操作"
        id={`actions-trigger-${file.id}`}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && createPortal(menuContent, document.body)}
    </div>
  );
}
