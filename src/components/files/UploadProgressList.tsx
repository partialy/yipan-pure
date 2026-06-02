/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useUploadStore } from '../../stores/upload.store';
import { formatBytes } from '../../lib/format';

export function UploadProgressList() {
  const { tasks, isQueuePanelOpen, toggleQueuePanel, removeTask, clearFinished } = useUploadStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 如果没有任务，不渲染任何组件
  if (tasks.length === 0) return null;

  const uploadingCount = tasks.filter((t) => t.status === 'uploading' || t.status === 'pending').length;
  const finishedCount = tasks.filter((t) => t.status === 'success' || t.status === 'error').length;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden select-none">
      {/* Panel title header bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {uploadingCount > 0 ? (
            <Loader2 size={14} className="animate-spin text-blue-400" />
          ) : (
            <CheckCircle2 size={14} className="text-emerald-400" />
          )}
          <span className="text-xs font-bold font-semibold tracking-wide">
            {uploadingCount > 0 ? `正在模拟上传 ${uploadingCount} 项` : `全部上传完成 (${finishedCount}项)`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? '展开面板' : '折叠面板'}
            id="toggle-upload-collapse"
          >
            {isCollapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          
          {/* Flush completely */}
          {uploadingCount === 0 && (
            <button
              type="button"
              onClick={clearFinished}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase px-1 cursor-pointer"
              title="清除所有完成记录"
              id="clear-closed-uploads"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {/* Task progression list container */}
      {!isCollapsed && (
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-2.5">
          {tasks.map((task) => (
            <div key={task.id} className="py-2.5 px-1.5 flex items-start gap-2.5">
              {/* Left format thumbnail or indicators */}
              <div className="w-7 h-7 bg-slate-50 border border-slate-200 rounded flex items-center justify-center shrink-0 text-slate-500 mt-0.5">
                {task.status === 'uploading' && (
                  <RefreshCw size={12} className="animate-spin text-blue-500" />
                )}
                {task.status === 'success' && (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                )}
                {task.status === 'error' && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
                {task.status === 'pending' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                )}
              </div>

              {/* Progress and names info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1 gap-1">
                  <p className="font-semibold text-slate-700 truncate" title={task.fileName}>
                    {task.fileName}
                  </p>
                  
                  {task.status === 'uploading' && (
                    <span className="text-[11px] font-mono font-bold text-blue-600 shrink-0">
                      {task.progress}%
                    </span>
                  )}
                </div>

                {/* Meter container */}
                {task.status === 'uploading' && (
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}

                {/* Sizes and labels */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{formatBytes(task.size)}</span>
                  {task.status === 'success' && (
                    <span className="text-emerald-600 font-bold">成功</span>
                  )}
                  {task.status === 'error' && (
                    <span className="text-red-600 font-bold truncate max-w-[120px]" title={task.errorMsg}>
                      {task.errorMsg || '加载出错'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action delete cancel */}
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                disabled={task.status === 'uploading'}
                className="text-slate-350 hover:text-slate-600 rounded disabled:opacity-30 disabled:pointer-events-none mt-0.5 cursor-pointer text-slate-300 hover:text-slate-500"
                title="删除任务"
                id={`cancel-task-${task.id}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
