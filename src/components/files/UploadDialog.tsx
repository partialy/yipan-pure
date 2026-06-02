/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CloudUpload, File as LucideFile } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileName: string, size: number) => void;
}

export function UploadDialog({ isOpen, onClose, onUpload }: UploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files) as globalThis.File[];
      processFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files) as globalThis.File[];
      processFiles(files);
    }
  };

  const processFiles = (files: globalThis.File[]) => {
    files.forEach((f) => {
      // 触发上传，将其加入 Zustand 任务队列中
      onUpload(f.name, f.size);
    });
    toast.success(`文件开始上传，共 ${files.length} 个任务`);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">模拟上传文件</h3>
            <p className="text-xs text-slate-500 mb-5">
              拖拽文件到下方区域，或者点击直接选择。此操作仅在前端进行高保真进度模拟，不会真传到后端。
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                <CloudUpload size={24} />
              </div>

              <p className="text-sm font-semibold text-slate-800 text-center mb-1">
                点击选择文件或把文件拖入此处
              </p>
              <p className="text-xs text-slate-400 text-center">
                支持拖拽多个不同后缀的图片、视频、文本或音频文件进行模拟
              </p>

              {/* 装饰卡 */}
              <div className="flex gap-2.5 mt-5">
                <span className="flex items-center gap-1 text-[11px] font-medium bg-white text-slate-500 px-2.5 py-1.5 rounded-md border border-slate-100 shadow-3xs">
                  <LucideFile size={12} className="text-emerald-500" /> *.jpg, *.png
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium bg-white text-slate-500 px-2.5 py-1.5 rounded-md border border-slate-100 shadow-3xs">
                  <LucideFile size={12} className="text-rose-500" /> *.pdf, *.md
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium bg-white text-slate-500 px-2.5 py-1.5 rounded-md border border-slate-100 shadow-3xs">
                  <LucideFile size={12} className="text-indigo-500" /> *.mp4, *.mp3
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 mt-6 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
