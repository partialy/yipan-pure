/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Copy, Link2, Calendar, ClipboardCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { useShareActions } from '../../hooks/useShareActions';
import { ShareInfo } from '../../types';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  onShareCreated?: (share: ShareInfo) => void;
}

export function ShareDialog({ isOpen, onClose, fileId, fileName, onShareCreated }: ShareDialogProps) {
  const { createShare, copyShareLink, isCreatingShare } = useShareActions();
  const [expireType, setExpireType] = useState<'forever' | '7d' | '30d'>('7d');
  const [generatedShare, setGeneratedShare] = useState<ShareInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const res = await createShare({ fileId, expireType });
      if (res.success && res.data) {
        setGeneratedShare(res.data);
        if (onShareCreated) {
          onShareCreated(res.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = async () => {
    if (generatedShare) {
      const ok = await copyShareLink(generatedShare.shareUrl);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleCancelAndReset = () => {
    setGeneratedShare(null);
    setCopied(false);
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
            onClick={handleCancelAndReset}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Link2 size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">生成分享链接</h3>
            </div>

            {!generatedShare ? (
              // 第一阶段：生成分享配置
              <div className="space-y-4 py-2">
                <p className="text-sm text-slate-600">
                  正在为 <strong>"{fileName}"</strong> 生成专属分享链接，设置下方的有效期属性：
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                    链接有效期
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['7d', '30d', 'forever'] as const).map((type) => {
                      const labelMap = { '7d': '7 天有效', '30d': '30 天有效', forever: '永久有效' };
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setExpireType(type)}
                          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-semibold transition-all ${
                            expireType === type
                              ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Calendar size={14} />
                          {labelMap[type]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2.5">
                  <div className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                    仅下载
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">
                    第一阶段仅提供只读下载权限，被分享者无需登录网盘亦可安全直接浏览并下载保存文件。
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-5">
                  <button
                    type="button"
                    onClick={handleCancelAndReset}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isCreatingShare}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isCreatingShare ? '正在生成...' : '立即生成链接'}
                  </button>
                </div>
              </div>
            ) : (
              // 第二阶段：成功生成并获取展示
              <div className="space-y-4 py-2">
                <p className="text-sm text-green-700 font-semibold bg-green-50 p-2 text-center rounded-lg border border-green-100">
                  ⚡ 恭喜你，分享链接已成功创建！
                </p>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    分享地址
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={generatedShare.shareUrl}
                      className="flex-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 outline-none select-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg bg-blue-600 px-3.5 py-2 text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      {copied ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100 mt-4">
                  <span>
                    过期机制: <strong>{generatedShare.expireType === 'forever' ? '永久有效' : generatedShare.expireType === '7d' ? '7天后过期' : '30天后过期'}</strong>
                  </span>
                  <span>
                    权限: <strong>仅限下载</strong>
                  </span>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={handleCancelAndReset}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
                  >
                    完成关闭
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
