/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 统一 API 响应格式
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  success: boolean;
  errorMsg?: string;
}

// 支持的文件类型
export type FileType =
  | 'folder'
  | 'image'
  | 'pdf'
  | 'text'
  | 'video'
  | 'audio'
  | 'archive'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'other';

// 用户信息
export interface User {
  id: string; // uuid
  username: string;
  email: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other' | 'keep_secret';
  birthday?: string;
  bio?: string;
  createdAt?: string; // 注册时间
  lastLoginAt?: string; // 上次登录时间
}

// 文件夹及文件模型
export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  parentId: string | null;
  url?: string;
  previewUrl?: string;
  downloadUrl?: string;
  mimeType?: string;
  extension?: string;
  createdAt: string;
  updatedAt: string;
  isStarred?: boolean;
  isDeleted?: boolean;
}

// 文件排序筛选参数
export interface FileListParams {
  folderId?: string | null;
  keyword?: string;
  sortBy?: 'name' | 'size' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  type?: FileType | 'all';
}

// 列表查询返回结构
export interface FileListResult {
  list: FileItem[];
  total: number;
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
}

// 面包屑模型
export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

// 上传任务队列项
export interface UploadTask {
  id: string;
  fileName: string;
  size: number;
  progress: number; // 0 - 100
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

// 分享信息模型
export interface ShareInfo {
  id: string;
  fileId: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  shareToken: string;
  shareUrl: string;
  permission: 'download';
  expireType: 'forever' | '7d' | '30d';
  expiredAt: string | null;
  createdAt: string;
}
