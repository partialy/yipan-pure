/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDB } from '../mocks/mock-db';
import { ShareInfo } from '../types';
import { request } from './request';

export const shareService = {
  // 生成分享记录
  createShare: async (fileId: string, expireType: 'forever' | '7d' | '30d') => {
    return request<ShareInfo>({
      url: '/api/shares',
      method: 'POST',
      data: { fileId, expireType },
      mockRunner: () => {
        const files = mockDB.getFiles();
        const file = files.find((f) => f.id === fileId);
        if (!file) {
          throw new Error('抱歉，分享目标文件不存在或已被删除');
        }

        const shareToken = `st-${Math.random().toString(36).substr(2, 8)}`;
        
        // 计算过期时间
        let expiredAt: string | null = null;
        if (expireType === '7d') {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          expiredAt = d.toISOString();
        } else if (expireType === '30d') {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          expiredAt = d.toISOString();
        }

        // 拼接分享路径 (使用前端路由)
        const host = window.location.origin;
        const shareUrl = `${host}/#/share/${shareToken}`; // 使用 HashRouter 或 BrowserRouter。为了兼容 preview，我们这里可以用 origin + /#/share/token 或 /share/token。我们设计上均兼容。

        const newShare: ShareInfo = {
          id: `s-${Math.random().toString(36).substr(2, 6)}`,
          fileId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          shareToken,
          shareUrl,
          permission: 'download',
          expireType,
          expiredAt,
          createdAt: new Date().toISOString(),
        };

        return mockDB.addShare(newShare);
      },
    });
  },

  // 获取我生成的全部分享记录
  getMyShares: async () => {
    return request<ShareInfo[]>({
      url: '/api/shares',
      method: 'GET',
      mockRunner: () => {
        return mockDB.getShares();
      },
    });
  },

  // 获取某个公开分享令牌的基础文件信息 (支持未登陆查看)
  getShareInfo: async (shareToken: string) => {
    return request<ShareInfo>({
      url: `/api/public/shares/${shareToken}`,
      method: 'GET',
      mockRunner: () => {
        const share = mockDB.getShareByToken(shareToken);
        if (!share) {
          throw new Error('您所访问的分享链接不存在或已过期失效');
        }
        return share;
      },
    });
  },

  // 取消我的某项分享
  cancelShare: async (shareId: string) => {
    return request<null>({
      url: `/api/shares/${shareId}`,
      method: 'DELETE',
      mockRunner: () => {
        mockDB.cancelShare(shareId);
        return null;
      },
    });
  },

  // 模拟下载分享文件
  downloadSharedFile: async (shareToken: string) => {
    return request<string>({
      url: `/api/public/shares/${shareToken}/download`,
      method: 'GET',
      mockRunner: () => {
        const share = mockDB.getShareByToken(shareToken);
        if (!share) {
          throw new Error('下载失败：分享链接已失效');
        }
        const file = mockDB.getFiles().find((f) => f.id === share.fileId);
        if (!file) {
          throw new Error('下载失败：原文件已被所有人彻底删除');
        }
        return file.downloadUrl || 'text_content';
      },
    });
  },
};
