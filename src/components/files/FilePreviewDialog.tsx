/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Download, FileText, Play, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { useFilePreview } from '../../hooks/useFilePreview';
import { formatBytes } from '../../lib/format';
import { FileIcon } from './FileIcon';

interface FilePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null;
  fileName: string;
  onDownload: () => void;
}

export function FilePreviewDialog({ isOpen, onClose, fileId, fileName, onDownload }: FilePreviewDialogProps) {
  const { previewInfo, isLoading, isError, error } = useFilePreview(isOpen ? fileId : null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-400">正在获取预览资源...</p>
        </div>
      );
    }

    if (isError || !previewInfo) {
      return (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
          <p className="text-sm font-semibold text-slate-600 mb-1">预览加载失败</p>
          <p className="text-xs text-slate-400 max-w-sm mb-4">{error?.message || '未知异常情况'}</p>
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Download size={14} /> 直接下载该文件
          </button>
        </div>
      );
    }

    const { type, previewUrl, content, size } = previewInfo;

    switch (type) {
      case 'image':
        return (
          <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden max-h-[420px] p-2">
            <img
              src={previewUrl}
              alt={fileName}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[380px] object-contain rounded-lg shadow-xs transition-transform hover:scale-[1.01]"
            />
          </div>
        );

      case 'video':
        return (
          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 shadow-lg select-none">
            <video
              src={previewUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 flex flex-col items-center justify-center space-y-5 shadow-xs">
            {/* Lofi track art illustration */}
            <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md animate-pulse">
              <Play size={32} className="fill-white translate-x-0.5" />
            </div>
            
            <div className="text-center min-w-0 w-full">
              <h4 className="font-bold text-slate-800 truncate text-sm">{fileName}</h4>
              <p className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider font-mono">
                Audio MP3 format • {formatBytes(size)}
              </p>
            </div>

            <audio src={previewUrl} controls className="w-full max-w-md bg-white border border-slate-100 rounded-lg shadow-3xs" />
          </div>
        );

      case 'text':
        return (
          <div className="flex flex-col space-y-2 max-h-[380px]">
            <span className="text-[10px] bg-blue-50 text-blue-700 w-max px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider font-mono">
              纯文本 / Markdown
            </span>
            <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-text">
              {content || '没有可读取的内容。'}
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} />
            </div>
            <p className="text-sm font-semibold text-slate-800 text-center mb-1">
              PDF 在线阅读器
            </p>
            <p className="text-xs text-slate-400 text-center max-w-xs mb-5 leading-normal">
              由于沙箱跨域限制，部分 PDF 资源建议在安全的环境中进行直接下载并阅读。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.open(previewUrl, '_blank')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg bg-white transition-colors"
              >
                尝试新窗口打开 PDF
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                id="pdf-download-btn"
              >
                <Download size={12} /> 下载文件
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="opacity-80 scale-[1.3] mb-4">
              <FileIcon type={type} />
            </div>
            <p className="text-sm font-semibold text-slate-800 text-center mb-1">
              暂不支持直接预览此类格式
            </p>
            <p className="text-xs text-slate-400 text-center max-w-xs mb-5">
              您可以直接将其下载到您的本地计算机中并关联对应辅助应用程序进行浏览。
            </p>
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Download size={14} /> 直接下载该文件
            </button>
          </div>
        );
    }
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
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileIcon type={previewInfo?.type || 'other'} size={18} />
                <h3 className="text-md font-bold text-slate-900 truncate" title={fileName}>
                  {fileName}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {previewInfo && (
                  <button
                    type="button"
                    onClick={onDownload}
                    className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                    title="下载文件"
                    id="preview-action-download"
                  >
                    <Download size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                  title="关闭预览"
                  id="preview-action-close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Main Interactive Screen */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {renderContent()}
            </div>

            {/* Footer */}
            {previewInfo && (
              <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-400 flex justify-between shrink-0 font-medium">
                <span>类型: <strong className="text-slate-600">{previewInfo.type.toUpperCase()}</strong></span>
                <span>大小: <strong className="text-slate-600">{formatBytes(previewInfo.size)}</strong></span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
