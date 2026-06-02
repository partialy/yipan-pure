/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const folderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '文件夹名称是必填项')
    .max(40, '名称过长，请控制在 40 字符内')
    .refine((val) => !/[\\/:*?"<>|]/.test(val), '名称不能包含字符 \\/:*?"<>|'),
});

type FolderFormValues = z.infer<typeof folderSchema>;

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function CreateFolderDialog({ isOpen, onClose, onSubmit, isLoading }: CreateFolderDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: '' },
  });

  const handleFormSubmit = async (data: FolderFormValues) => {
    await onSubmit(data.name);
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">新建文件夹</h3>
            <p className="text-xs text-slate-500 mb-4">在这个目录下创建一个新目录来存放您的文件。</p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label htmlFor="folder-name-input" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  文件夹名称
                </label>
                <input
                  id="folder-name-input"
                  type="text"
                  placeholder="请输入名称，例如：Project Assets"
                  autoFocus
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm outline-none transition-all ${
                    errors.name
                      ? 'border-red-500 focus:ring-1 focus:ring-red-400'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
                  }`}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isLoading ? '创建中...' : '开始创建'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
