/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { fileService } from '../services/file.service';
import { UploadTask } from '../types';

interface UploadState {
  tasks: UploadTask[];
  isQueuePanelOpen: boolean;
  addUploadTask: (
    fileName: string,
    size: number,
    parentId: string | null,
    onSuccess: () => void
  ) => void;
  removeTask: (id: string) => void;
  toggleQueuePanel: (open?: boolean) => void;
  clearFinished: () => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  tasks: [],
  isQueuePanelOpen: false,

  addUploadTask: (fileName, size, parentId, onSuccess) => {
    const taskId = `task-${Math.random().toString(36).substr(2, 6)}`;
    const newTask: UploadTask = {
      id: taskId,
      fileName,
      size,
      progress: 0,
      status: 'pending',
    };

    // 添加到队列并自动打开上传看板
    set((state) => ({
      tasks: [newTask, ...state.tasks],
      isQueuePanelOpen: true,
    }));

    // 模拟假上传进度更新
    let currentProgress = 0;
    const intervalTime = 300; // 每300ms
    
    newTask.status = 'uploading';
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: 'uploading' } : t)),
    }));

    const timer = setInterval(() => {
      // 随机增加进度 15% - 30%
      const increment = Math.floor(Math.random() * 16) + 15;
      currentProgress = Math.min(100, currentProgress + increment);

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, progress: currentProgress } : t
        ),
      }));

      // 如果完了
      if (currentProgress >= 100) {
        clearInterval(timer);

        // 调用 fileService.uploadFile 真实增加记录
        fileService
          .uploadFile({ name: fileName, size, parentId })
          .then((res) => {
            if (res.success) {
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === taskId ? { ...t, status: 'success' as const } : t
                ),
              }));
              // 调用回调刷新文件列表
              onSuccess();
            } else {
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === taskId
                    ? { ...t, status: 'error' as const, errorMsg: res.msg || '无法保存' }
                    : t
                ),
              }));
            }
          })
          .catch((err) => {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, status: 'error' as const, errorMsg: err.message || '上传异常' }
                  : t
              ),
            }));
          });
      }
    }, intervalTime);
  },

  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  toggleQueuePanel: (open) => {
    set((state) => ({
      isQueuePanelOpen: open !== undefined ? open : !state.isQueuePanelOpen,
    }));
  },

  clearFinished: () => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status === 'uploading' || t.status === 'pending'),
    }));
  },
}));
