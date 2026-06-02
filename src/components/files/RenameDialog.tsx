/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const renameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '名称不能为空')
    .max(80, '名字过长')
    .refine((val) => !/[\\/:*?"<>|]/.test(val), '名称不能包含字符 \\/:*?"<>|'),
});

type RenameFormValues = z.infer<typeof renameSchema>;

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => Promise<void>;
  initialName: string;
  isLoading: boolean;
}

export function RenameDialog({ isOpen, onClose, onSubmit, initialName, isLoading }: RenameDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: initialName },
  });

  // 当外部初始名变化时，重置表单默认值
  useEffect(() => {
    if (isOpen) {
      reset({ name: initialName });
    }
  }, [isOpen, initialName, reset]);

  const handleFormSubmit = async (data: RenameFormValues) => {
    await onSubmit(data.name);
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">重命名</h3>
            <p className="text-xs text-slate-500 mb-4">重新为当前的资源修改一个更容易识别的名称。</p>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label htmlFor="rename-input" className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  新名称
                </label>
                <input
                  id="rename-input"
                  type="text"
                  placeholder="请输入名称"
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
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? '确认中...' : '确认重命名'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
