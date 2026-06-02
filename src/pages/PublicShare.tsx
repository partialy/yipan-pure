/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cloud, Download, Lock, CheckCircle2, AlertTriangle, FileText, ArrowRight, CornerDownRight } from 'lucide-react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicShare } from '../hooks/usePublicShare';
import { formatBytes, formatFriendlyDate } from '../lib/format';
import { FileIcon } from '../components/files/FileIcon';

export function PublicShare() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const tokenValue = shareToken || '';

  const { shareInfo, isLoading, isError, error, downloadFile, isDownloading } =
    usePublicShare(tokenValue);

  const handleDownload = async () => {
    try {
      await downloadFile();
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-between p-6 select-none font-sans relative">
      {/* Background ambient gradients */}
      <div className="absolute inset-x-0 top-0 h-64 bg-radial-gradient from-blue-50/50 to-transparent pointer-events-none" />

      {/* Top logo header */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 shrink-0 z-10 border-b border-slate-100 mb-8">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={navigateToLogin}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Cloud size={16} strokeWidth={2.5} />
          </div>
          <span className="font-black text-slate-800 text-base tracking-tight">CloudSphere</span>
        </div>
        <button
          type="button"
          onClick={navigateToLogin}
          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          id="go-to-portal-btn"
        >
          <span>开通专属云盘网盘</span>
          <ArrowRight size={13} />
        </button>
      </header>

      {/* Centered card content */}
      <main className="flex-1 w-full max-w-md flex flex-col justify-center py-10 z-10">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-10 text-center flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500">正在安全解密获取公共通道...</p>
          </div>
        ) : isError || !shareInfo ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center flex flex-col items-center animate-fadeIn">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">该分享链接已失效</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
              很抱歉，该公开分享链接在系统中不存在，或已超过发布人限定的 7天 / 30天 有效期而被系统安全拦截注销。
            </p>
            <button
              type="button"
              onClick={navigateToLogin}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              返回云盘登陆首页
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Header branding lock banner */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white select-none">
              <span className="text-[10px] uppercase font-mono tracking-widest font-black text-slate-400">
                ⭐ SECURE SHARING PORTAL
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-semibold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <CheckCircle2 size={10} /> 状态: 安全
              </span>
            </div>

            {/* Asset detailed core */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-xl border border-slate-100 mb-4 select-none">
                <div className="scale-[1.4] mb-3">
                  <FileIcon type={shareInfo.fileType} />
                </div>
                <h4 className="font-bold text-slate-800 text-center text-sm truncate max-w-[280px] px-2" title={shareInfo.fileName}>
                  {shareInfo.fileName}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase font-semibold tracking-wider">
                  {shareInfo.fileType.toUpperCase()} Format • {formatBytes(shareInfo.fileSize)}
                </p>
              </div>

              {/* Security info cells */}
              <div className="space-y-3 border-t border-b border-slate-100 py-4 text-xs font-semibold select-none">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-slate-400">分享者</span>
                  <span className="text-slate-700 font-bold">网盘系统官方</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-slate-400">生成日期</span>
                  <span className="text-slate-700 font-mono text-[11px]">
                    {formatFriendlyDate(shareInfo.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-slate-400">有效期性质</span>
                  <span className="text-slate-700">
                    {shareInfo.expireType === 'forever' ? '永久有效' : shareInfo.expireType === '7d' ? '7天有效' : '30天有效'}
                  </span>
                </div>
              </div>

              {/* Instruction banner */}
              <div className="flex items-start gap-2 text-slate-400 text-[11px] leading-relaxed select-none">
                <CornerDownRight size={14} className="shrink-0 text-blue-500 mt-0.5" />
                <p className="text-slate-500">
                  此链接经过加密，已剔除分享者一切敏感目录与索引路径。点击下方下载按钮直接拉取字节流。
                </p>
              </div>

              {/* Action triggering Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                id="btn-public-download"
              >
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
                    <span>正在同步协议解密...</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>免密极速下载获取文件</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer references */}
      <footer className="w-full max-w-5xl py-4 border-t border-slate-100 text-center shrink-0 z-10 text-[10px] text-slate-400 font-medium">
        <p>© 2026 CloudSphere Lite Personal NetDisk Encryption Shared System.</p>
      </footer>
    </div>
  );
}
export default PublicShare;
