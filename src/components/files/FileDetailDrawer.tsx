/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download, Star, StarOff, Trash2, X, Calendar, Database, FileMinus, Copy, Scissors, Clipboard } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { useFileActions } from '../../hooks/useFileActions';
import { formatBytes, formatFriendlyDate } from '../../lib/format';
import { FileItem } from '../../types';
import { FileIcon } from './FileIcon';

interface FileDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onDownload: () => void;
  onDeleteClick: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPasteSpecial?: () => void;
  canPaste?: boolean;
}

export function FileDetailDrawer({
  isOpen,
  onClose,
  file,
  onDownload,
  onDeleteClick,
  onCopy,
  onCut,
  onPasteSpecial,
  canPaste = false,
}: FileDetailDrawerProps) {
  const { toggleStar, isTogglingStar } = useFileActions();

  if (!file) return null;

  const handleToggleStar = async () => {
    await toggleStar(file.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile backing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-40 bg-black backdrop-blur-3xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed md:static top-0 right-0 z-40 h-full w-80 border-l border-slate-200 bg-white shadow-xl md:shadow-none flex flex-col shrink-0 select-none overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                文件详情属性
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-md transition-colors"
                id="close-drawer-btn"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Giant icon container mimicking drive client */}
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                <div className="scale-[1.5] mb-4">
                  <FileIcon type={file.type} />
                </div>
                <h4 className="font-bold text-slate-800 text-center text-sm truncate w-full px-2" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1 uppercase font-semibold tracking-wider">
                  {file.type === 'folder' ? '文件夹' : `.${file.extension || 'file'}`}
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-4">
                {/* Download */}
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={file.type === 'folder'}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/20 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:border-slate-200 transition-all text-xs font-semibold gap-1.5"
                  title="下载文件"
                >
                  <Download size={15} />
                  <span>下载</span>
                </button>

                {/* Star toggle */}
                <button
                  type="button"
                  onClick={handleToggleStar}
                  disabled={isTogglingStar}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold gap-1.5 transition-all ${
                    file.isStarred
                      ? 'border-amber-400 bg-amber-50/20 text-amber-600 hover:bg-amber-50'
                      : 'border-slate-200 text-slate-600 hover:text-amber-500 hover:border-amber-400 hover:bg-amber-50/20'
                  }`}
                  title={file.isStarred ? '取消星标' : '星标收藏'}
                  id="star-drawer-btn"
                >
                  {file.isStarred ? <Star size={15} className="fill-amber-500" /> : <StarOff size={15} />}
                  <span>{file.isStarred ? '已收藏' : '收藏'}</span>
                </button>

                {/* Delete direct */}
                <button
                  type="button"
                  onClick={onDeleteClick}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-400 hover:bg-red-50/20 transition-all text-xs font-semibold gap-1.5"
                  title="删除资源"
                  id="delete-shortcut-drawer"
                >
                  <Trash2 size={15} />
                  <span>删除</span>
                </button>
              </div>

              {/* Copy / Cut / Paste Row */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="flex items-center justify-center py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/20 transition-all text-xs font-semibold gap-1.5 cursor-pointer"
                    title="复制到剪贴板"
                    id="drawer-copy-btn"
                  >
                    <Copy size={13} className="text-slate-400" />
                    <span>复制</span>
                  </button>

                  <button
                    type="button"
                    onClick={onCut}
                    className="flex items-center justify-center py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/20 transition-all text-xs font-semibold gap-1.5 cursor-pointer"
                    title="剪切移动"
                    id="drawer-cut-btn"
                  >
                    <Scissors size={13} className="text-slate-400" />
                    <span>移动 / 剪切</span>
                  </button>
                </div>

                {file.type === 'folder' && canPaste && onPasteSpecial && (
                  <button
                    type="button"
                    onClick={onPasteSpecial}
                    className="w-full flex items-center justify-center py-2 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50 transition-all text-xs font-bold gap-1.5 animate-pulse cursor-pointer"
                    title="粘贴项目至此文件夹内部"
                    id="drawer-paste-folder-btn"
                  >
                    <Clipboard size={13} className="text-emerald-600" />
                    <span>粘贴至此文件夹</span>
                  </button>
                )}
              </div>

              {/* Advanced info cells */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Database size={15} className="text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      文件大小
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {file.type === 'folder' ? '目录项' : formatBytes(file.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      修改时间
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatFriendlyDate(file.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      创建时间
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatFriendlyDate(file.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileMinus size={15} className="text-slate-400 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      路径索引 ID
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500 break-all select-all block bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {file.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
