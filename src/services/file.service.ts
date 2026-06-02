/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDB } from '../mocks/mock-db';
import { BreadcrumbItem, FileItem, FileListParams, FileListResult, FileType } from '../types';
import { request } from './request';

// 根据后缀自动映射 FileType
export function mapExtensionToType(ext: string): FileType {
  const mimeMap: Record<string, FileType> = {
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    pdf: 'pdf',
    txt: 'text',
    md: 'text',
    html: 'text',
    js: 'text',
    ts: 'text',
    json: 'text',
    css: 'text',
    mp4: 'video',
    webm: 'video',
    avi: 'video',
    mov: 'video',
    mp3: 'audio',
    wav: 'audio',
    ogg: 'audio',
    m4a: 'audio',
    zip: 'archive',
    rar: 'archive',
    '7z': 'archive',
    tar: 'archive',
    gz: 'archive',
    doc: 'document',
    docx: 'document',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    ppt: 'presentation',
    pptx: 'presentation',
  };
  return mimeMap[ext.toLowerCase()] || 'other';
}

export const fileService = {
  // 获取文件列表 (支持主目录导航、最近使用、星标、回收站以及搜索/排序特征)
  getFileList: async (params: FileListParams) => {
    return request<FileListResult>({
      url: `/api/files?folderId=${params.folderId || ''}`,
      method: 'GET',
      mockRunner: () => {
        const allFiles = mockDB.getFiles();
        let targetFiles: FileItem[] = [];

        const folderId = params.folderId;
        
        // 1. 根据不同特殊虚拟文件夹/导航类别，过滤基础文件子集
        if (folderId === '__recent__') {
          // 最近使用: 非文件夹、未删除、最近修改
          targetFiles = allFiles.filter((f) => f.type !== 'folder' && f.isDeleted !== true);
          targetFiles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          targetFiles = targetFiles.slice(0, 15); // 只显示15个
        } else if (folderId === '__starred__') {
          // 收藏星标的: 星标、未删除
          targetFiles = allFiles.filter((f) => f.isStarred === true && f.isDeleted !== true);
        } else if (folderId === '__trash__') {
          // 回收站: 已删除
          targetFiles = allFiles.filter((f) => f.isDeleted === true);
        } else {
          // 常规我的文件：展示指定 folderId 下的直接子集，排除已删除的
          const currentId = folderId || null;
          targetFiles = allFiles.filter((f) => f.parentId === currentId && f.isDeleted !== true);
        }

        // 2. 搜索框过滤 (keyword)
        if (params.keyword && params.keyword.trim() !== '') {
          const kw = params.keyword.trim().toLowerCase();
          // 如果是特殊视图，进行搜索；如果是普通视图，则在当前子树/或者全局下模糊查找 (一般网盘是全局搜索，这里我们支持模糊匹配)
          targetFiles = targetFiles.filter((f) => f.name.toLowerCase().includes(kw));
        }

        // 3. 文件类别赛选过滤 (type filter)
        if (params.type && params.type !== 'all') {
          targetFiles = targetFiles.filter((f) => f.type === params.type);
        }

        // 4. 用户排序 (sortBy & sortOrder)
        const sortBy = params.sortBy || 'name';
        const sortOrder = params.sortOrder || 'asc';

        targetFiles.sort((a, b) => {
          // 始终让文件夹排在普通文件前面
          if (a.type === 'folder' && b.type !== 'folder') return -1;
          if (a.type !== 'folder' && b.type === 'folder') return 1;

          let comparison = 0;
          if (sortBy === 'name') {
            comparison = a.name.localeCompare(b.name, 'zh-CN');
          } else if (sortBy === 'size') {
            comparison = a.size - b.size;
          } else {
            const timeA = new Date(a[sortBy]).getTime();
            const timeB = new Date(b[sortBy]).getTime();
            comparison = timeA - timeB;
          }
          return sortOrder === 'asc' ? comparison : -comparison;
        });

        // 5. 计算面包屑 Breadcrumbs
        const breadcrumbs: BreadcrumbItem[] = [];
        
        // 初始我的文件根
        if (folderId === '__recent__') {
          breadcrumbs.push({ id: '__recent__', name: '最近使用' });
        } else if (folderId === '__starred__') {
          breadcrumbs.push({ id: '__starred__', name: '我的收藏' });
        } else if (folderId === '__trash__') {
          breadcrumbs.push({ id: '__trash__', name: '回收站' });
        } else {
          breadcrumbs.push({ id: null, name: '主目录' });
          if (folderId) {
            const pathNodes: BreadcrumbItem[] = [];
            let currentFolder = allFiles.find((f) => f.id === folderId && f.type === 'folder');
            while (currentFolder) {
              pathNodes.unshift({ id: currentFolder.id, name: currentFolder.name });
              const nextParentId = currentFolder.parentId;
              currentFolder = nextParentId ? allFiles.find((f) => f.id === nextParentId && f.type === 'folder') : undefined;
            }
            breadcrumbs.push(...pathNodes);
          }
        }

        return {
          list: targetFiles,
          total: targetFiles.length,
          currentFolderId: folderId || null,
          breadcrumbs,
        };
      },
    });
  },

  // 创建文件夹
  createFolder: async (params: { name: string; parentId: string | null }) => {
    return request<FileItem>({
      url: '/api/files/folder',
      method: 'POST',
      data: params,
      mockRunner: () => {
        const newFolder: FileItem = {
          id: `f-folder-${Math.random().toString(36).substr(2, 6)}`,
          name: params.name.trim(),
          type: 'folder',
          size: 0, // 初始大小为 0
          parentId: params.parentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return mockDB.addFile(newFolder);
      },
    });
  },

  // 重命名文件或目录
  renameFile: async (fileId: string, name: string) => {
    return request<FileItem>({
      url: `/api/files/${fileId}/rename`,
      method: 'PATCH',
      data: { name },
      mockRunner: () => {
        return mockDB.renameFile(fileId, name);
      },
    });
  },

  // 软删除、彻底删除
  deleteFile: async (fileId: string, permanent: boolean = false) => {
    return request<null>({
      url: `/api/files/${fileId}?permanent=${permanent}`,
      method: 'DELETE',
      mockRunner: () => {
        mockDB.deleteFile(fileId, permanent);
        return null;
      },
    });
  },

  // 恢复删除的项
  restoreFile: async (fileId: string) => {
    return request<null>({
      url: `/api/files/${fileId}/restore`,
      method: 'PATCH',
      mockRunner: () => {
        mockDB.restoreFile(fileId);
        return null;
      },
    });
  },

  // 收藏 / 移除收藏星标
  toggleStar: async (fileId: string) => {
    return request<FileItem>({
      url: `/api/files/${fileId}/star`,
      method: 'PATCH',
      mockRunner: () => {
        return mockDB.toggleStar(fileId);
      },
    });
  },

  // 移动文件
  moveFile: async (fileId: string, targetParentId: string | null) => {
    return request<FileItem>({
      url: `/api/files/${fileId}/move`,
      method: 'POST',
      data: { targetParentId },
      mockRunner: () => {
        return mockDB.moveFile(fileId, targetParentId);
      },
    });
  },

  // 复制文件
  copyFile: async (fileId: string, targetParentId: string | null) => {
    return request<FileItem>({
      url: `/api/files/${fileId}/copy`,
      method: 'POST',
      data: { targetParentId },
      mockRunner: () => {
        return mockDB.copyFile(fileId, targetParentId);
      },
    });
  },

  // 获取文件详细/预览数据
  getPreviewInfo: async (fileId: string) => {
    return request<{ fileId: string; name: string; type: FileType; size: number; previewUrl?: string; content?: string }>({
      url: `/api/files/${fileId}/preview`,
      method: 'GET',
      mockRunner: () => {
        const files = mockDB.getFiles();
        const file = files.find((f) => f.id === fileId);
        if (!file) {
          throw new Error('未找到预览文件目标');
        }
        
        let content = '';
        if (file.type === 'text') {
          content = mockDB.getTextContent(fileId);
        }

        return {
          fileId: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl: file.previewUrl,
          content,
        };
      },
    });
  },

  // 文件假上传模拟逻辑
  uploadFile: async (params: { name: string; size: number; parentId: string | null; downloadUrl?: string }) => {
    return request<FileItem>({
      url: '/api/files/upload',
      method: 'POST',
      data: params,
      mockRunner: () => {
        const ext = params.name.split('.').pop() || '';
        const mappedType = mapExtensionToType(ext);

        let mockUrl = params.downloadUrl;
        if (!mockUrl) {
          // 提供几个好看的默认资源链接
          if (mappedType === 'image') {
            mockUrl = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop';
          } else if (mappedType === 'audio') {
            mockUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
          } else if (mappedType === 'video') {
            mockUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
          } else if (mappedType === 'pdf') {
            mockUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';
          } else {
            mockUrl = 'text_content';
          }
        }

        const newFile: FileItem = {
          id: `f-${Math.random().toString(36).substr(2, 6)}`,
          name: params.name,
          type: mappedType,
          size: params.size,
          parentId: params.parentId,
          url: mockUrl,
          previewUrl: mockUrl,
          downloadUrl: mockUrl,
          extension: ext,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isStarred: false,
        };

        return mockDB.addFile(newFile);
      },
    });
  },
};
