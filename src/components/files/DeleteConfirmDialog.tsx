/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permanent: boolean) => Promise<void>;
  fileName: string;
  isTrashView: boolean; // 如果在回收站中，默认物理彻底删除；如果在常规文件目录中，可以选择进入回收站或者直接彻底删除
  isLoading: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  isTrashView,
  isLoading,
}: DeleteConfirmDialogProps) {
  
  const handleConfirm = (permanent: boolean) => {
    onConfirm(permanent);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">确认删除文件？</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-2">
              您确定要删除资源 <strong>"{fileName}"</strong> 吗？
            </p>

            {isTrashView ? (
              <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg mb-5 border border-red-100">
                注意：当前处于回收站。此操作将彻底物理删除此文件，磁盘数据将无法被恢复！
              </p>
            ) : (
              <p className="text-xs text-slate-500 mb-5">
                默认情况下会移入<strong>回收站</strong>，您可以随时在回收站列表中将其轻松还原。
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>

              {/* 仅在非回收站页面时支持“软删除（放回回收站）” */}
              {!isTrashView && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleConfirm(false)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 transition-colors"
                >
                  移入回收站
                </button>
              )}

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleConfirm(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isTrashView ? '彻底物理删除' : '直接彻底删除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
