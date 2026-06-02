/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileItem, ShareInfo, User } from '../types';

// 本地离线持久化存储键名
const STORAGE_KEYS = {
  TOKEN: 'netdisk_token',
  USER: 'netdisk_user',
  FILES: 'netdisk_files',
  SHARES: 'netdisk_shares',
  USERS: 'netdisk_registered_users',
};

// 预设的文件类型图标及预览内容
const DEFAULT_TEXT_CONTENT = `## 个人网盘项目第一阶段前端计划

网盘系统架构核心交互点已基本落地。
- **技术栈**：React + TS + Tailwind CSS + Zustand + React Query + Framer Motion
- **设计风格**：Clean Utility / Minimal 简洁冷淡风，追求高质感细节
- **Mock机制**：采用基于 localStorage 的完全持久化文件库
- **分享模型**：生成专属分享 Token，具备失效判定

目前状态为：Mock 服务启动成功。`;

// 初始种子用户数据
const INITIAL_USERS: Record<string, string> = {
  'user@example.com': '123456',
  'pisamusic23@gmail.com': '123456',
};

// 初始化种子文件
const INITIAL_FILES: FileItem[] = [
  {
    id: 'f-folder-1',
    name: 'Assets Library',
    type: 'folder',
    size: 2457600000,
    parentId: null,
    createdAt: '2026-05-15T12:00:00Z',
    updatedAt: '2026-05-20T14:30:00Z',
  },
  {
    id: 'f-folder-2',
    name: 'Project Documents',
    type: 'folder',
    size: 51200000,
    parentId: null,
    createdAt: '2026-05-18T10:00:00Z',
    updatedAt: '2026-05-18T10:30:00Z',
  },
  {
    id: 'f-img-1',
    name: 'Brand_Identity.png',
    type: 'image',
    size: 12582912, // 12MB
    parentId: null,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    mimeType: 'image/png',
    extension: 'png',
    createdAt: '2026-05-31T20:12:00Z',
    updatedAt: '2026-06-01T02:15:00Z',
    isStarred: true,
  },
  {
    id: 'f-img-2',
    name: 'Office_Photo.jpg',
    type: 'image',
    size: 4194304, // 4MB
    parentId: 'f-folder-1',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    previewUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    downloadUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    createdAt: '2026-05-20T09:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z',
  },
  {
    id: 'f-pdf-1',
    name: 'Design_Manual.pdf',
    type: 'pdf',
    size: 4718592, // 4.5MB
    parentId: 'f-folder-2',
    url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    previewUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    downloadUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
    createdAt: '2026-05-25T11:00:00Z',
    updatedAt: '2026-05-25T11:00:00Z',
    isStarred: true,
  },
  {
    id: 'f-txt-1',
    name: 'DeveloperPlan.md',
    type: 'text',
    size: 1024, // 1KB
    parentId: 'f-folder-2',
    url: 'text_content', // 文本类型直接携带标识，单独获取
    previewUrl: 'text_content',
    downloadUrl: 'text_content',
    mimeType: 'text/markdown',
    extension: 'md',
    createdAt: '2026-05-28T09:15:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'f-video-1',
    name: 'Space_Ambient_Demo.mp4',
    type: 'video',
    size: 125829120, // 120MB
    parentId: null,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mimeType: 'video/mp4',
    extension: 'mp4',
    createdAt: '2026-05-29T16:40:00Z',
    updatedAt: '2026-05-29T16:40:00Z',
  },
  {
    id: 'f-audio-1',
    name: 'Lofi_Study_Relax.mp3',
    type: 'audio',
    size: 7864320, // 7.5MB
    parentId: null,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    mimeType: 'audio/mpeg',
    extension: 'mp3',
    createdAt: '2026-05-30T10:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
  },
];

class MockDB {
  constructor() {
    this.init();
  }

  // 初始化写入 LocalStorage
  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FILES)) {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(INITIAL_FILES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHARES)) {
      localStorage.setItem(STORAGE_KEYS.SHARES, JSON.stringify([]));
    }
  }

  // == 认证数据相关 ==
  getUsers(): Record<string, string> {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  addUser(email: string, pass: string) {
    const users = this.getUsers();
    users[email] = pass;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // == 文件数据操作 ==
  getFiles(): FileItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    return raw ? JSON.parse(raw) : INITIAL_FILES;
  }

  saveFiles(files: FileItem[]) {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }

  // 添加新文件/文件夹
  addFile(file: FileItem) {
    const files = this.getFiles();
    // 检查重名 (同级目录下不能有同名同类型)
    const exists = files.some(
      (f) =>
        f.parentId === file.parentId &&
        f.name.toLowerCase() === file.name.toLowerCase() &&
        f.isDeleted !== true
    );
    if (exists) {
      throw new Error(`同级目录下已存在名为 "${file.name}" 的${file.type === 'folder' ? '文件夹' : '文件'}`);
    }
    files.push(file);
    this.saveFiles(files);
    return file;
  }

  // 重命名
  renameFile(fileId: string, newName: string): FileItem {
    const files = this.getFiles();
    const idx = files.findIndex((f) => f.id === fileId);
    if (idx === -1) {
      throw new Error('未找到该文件或文件夹');
    }
    
    const file = files[idx];
    if (!newName || newName.trim() === '') {
      throw new Error('命名不能为空');
    }

    // 重名检查 (同级非当前主体)
    const exists = files.some(
      (f) =>
        f.id !== fileId &&
        f.parentId === file.parentId &&
        f.name.toLowerCase() === newName.trim().toLowerCase() &&
        f.isDeleted !== true
    );
    if (exists) {
      throw new Error(`同级目录下已存在名为 "${newName.trim()}" 的资源`);
    }

    file.name = newName.trim();
    file.updatedAt = new Date().toISOString();
    this.saveFiles(files);
    return file;
  }

  // 移至回收站 / 彻底删除
  deleteFile(fileId: string, permanent: boolean = false) {
    let files = this.getFiles();
    const idx = files.findIndex((f) => f.id === fileId);
    if (idx === -1) {
      throw new Error('该文件不存在');
    }

    if (permanent) {
      // 递归删除文件夹子项
      const fileToDelete = files[idx];
      if (fileToDelete.type === 'folder') {
        files = this.deleteFolderRecursively(files, fileId);
      } else {
        files.splice(idx, 1);
      }
    } else {
      // 临时软删除
      const target = files[idx];
      target.isDeleted = true;
      target.updatedAt = new Date().toISOString();

      // 如果是文件夹，递归将其所有子项标记为 isDeleted
      if (target.type === 'folder') {
        this.markFolderDeletedRecursively(files, fileId, true);
      }
    }
    this.saveFiles(files);
  }

  private deleteFolderRecursively(list: FileItem[], folderId: string): FileItem[] {
    // 找出所有 parentId 为 folderId 的子项
    const children = list.filter((f) => f.parentId === folderId);
    let updatedList = list.filter((f) => f.id !== folderId); // 删除当前文件夹
    for (const child of children) {
      if (child.type === 'folder') {
        updatedList = this.deleteFolderRecursively(updatedList, child.id);
      } else {
        updatedList = updatedList.filter((f) => f.id !== child.id);
      }
    }
    return updatedList;
  }

  private markFolderDeletedRecursively(list: FileItem[], folderId: string, deleted: boolean) {
    const children = list.filter((f) => f.parentId === folderId);
    for (const child of children) {
      child.isDeleted = deleted;
      child.updatedAt = new Date().toISOString();
      if (child.type === 'folder') {
        this.markFolderDeletedRecursively(list, child.id, deleted);
      }
    }
  }

  // 恢复删除
  restoreFile(fileId: string) {
    const files = this.getFiles();
    const idx = files.findIndex((f) => f.id === fileId);
    if (idx === -1) {
      throw new Error('未找到该文件');
    }
    files[idx].isDeleted = false;
    files[idx].updatedAt = new Date().toISOString();

    if (files[idx].type === 'folder') {
      this.markFolderDeletedRecursively(files, fileId, false);
    }
    this.saveFiles(files);
  }

  // 移动文件或文件夹
  moveFile(fileId: string, targetParentId: string | null): FileItem {
    const files = this.getFiles();
    const idx = files.findIndex((f) => f.id === fileId);
    if (idx === -1) {
      throw new Error('未找到该文件或文件夹');
    }
    
    const file = files[idx];

    // 如果目标路径和现在是一样的，且不是移动到不同的祖先，直接返回
    if (file.parentId === targetParentId) {
      return file;
    }

    // 防止如果是文件夹，被移动到自身或者自己的子孙文件夹内部
    if (file.type === 'folder' && targetParentId !== null) {
      if (fileId === targetParentId) {
        throw new Error('无法将文件夹移动到自身内部');
      }
      let currId: string | null = targetParentId;
      while (currId) {
        const parent = files.find((f) => f.id === currId);
        if (!parent) break;
        if (parent.parentId === fileId) {
          throw new Error('无法将文件夹移动到其子文件夹内部');
        }
        currId = parent.parentId;
      }
    }

    // 检查重名 (目标目录下同名)
    const exists = files.some(
      (f) =>
        f.parentId === targetParentId &&
        f.id !== fileId &&
        f.name.toLowerCase() === file.name.toLowerCase() &&
        f.isDeleted !== true
    );
    if (exists) {
      throw new Error(`目标目录下已存在同名资源: "${file.name}"`);
    }

    file.parentId = targetParentId;
    file.updatedAt = new Date().toISOString();
    this.saveFiles(files);
    return file;
  }

  // 复制文件或整个文件夹
  copyFile(fileId: string, targetParentId: string | null): FileItem {
    const files = this.getFiles();
    const file = files.find((f) => f.id === fileId);
    if (!file) {
      throw new Error('未找到要复制的源文件');
    }

    if (file.type === 'folder') {
      return this.copyFolderRecursively(fileId, targetParentId);
    } else {
      // 获取文件名后缀并处理冲突（加 副本 标记）
      let newName = file.name;
      const dotIndex = file.name.lastIndexOf('.');
      const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      const ext = dotIndex !== -1 ? file.name.substring(dotIndex) : '';

      let counter = 1;
      while (
        files.some(
          (f) =>
            f.parentId === targetParentId &&
            f.name.toLowerCase() === newName.toLowerCase() &&
            f.isDeleted !== true
        )
      ) {
        newName = `${baseName}_副本${counter}${ext}`;
        counter++;
      }

      const newFileId = `f-${String(Math.random()).substring(2, 8)}`;
      const newFile: FileItem = {
        ...file,
        id: newFileId,
        name: newName,
        parentId: targetParentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isStarred: false,
        isDeleted: false,
      };

      files.push(newFile);
      this.saveFiles(files);
      return newFile;
    }
  }

  private copyFolderRecursively(folderId: string, targetParentId: string | null): FileItem {
    const files = this.getFiles();
    const folder = files.find((f) => f.id === folderId);
    if (!folder) {
      throw new Error('未找到要复制的原始文件夹');
    }

    let newFolderName = folder.name;
    let counter = 1;
    while (
      files.some(
        (f) =>
          f.parentId === targetParentId &&
          f.name.toLowerCase() === newFolderName.toLowerCase() &&
          f.isDeleted !== true
      )
    ) {
      newFolderName = `${folder.name}_副本${counter}`;
      counter++;
    }

    const newFolderId = `f-folder-${String(Math.random()).substring(2, 8)}`;
    const newFolder: FileItem = {
      ...folder,
      id: newFolderId,
      name: newFolderName,
      parentId: targetParentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isStarred: false,
      isDeleted: false,
    };

    // 写入新文件夹
    files.push(newFolder);
    this.saveFiles(files);

    // 递归读取属于原文件夹的所有直接子项并复制（排除已删除的）
    // 注意，每次 copyFile 都会回写 localStorage，因此我们可以放心操作
    const children = files.filter((f) => f.parentId === folderId && f.isDeleted !== true);
    for (const child of children) {
      this.copyFile(child.id, newFolderId);
    }

    return newFolder;
  }

  // 收藏 / 星标
  toggleStar(fileId: string): FileItem {
    const files = this.getFiles();
    const idx = files.findIndex((f) => f.id === fileId);
    if (idx === -1) {
      throw new Error('该文件不存在');
    }
    const val = !files[idx].isStarred;
    files[idx].isStarred = val;
    files[idx].updatedAt = new Date().toISOString();
    this.saveFiles(files);
    return files[idx];
  }

  // == 分享数据操作 ==
  getShares(): ShareInfo[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHARES);
    return raw ? JSON.parse(raw) : [];
  }

  saveShares(shares: ShareInfo[]) {
    localStorage.setItem(STORAGE_KEYS.SHARES, JSON.stringify(shares));
  }

  addShare(share: ShareInfo) {
    const shares = this.getShares();
    shares.push(share);
    this.saveShares(shares);
    return share;
  }

  getShareByToken(token: string): ShareInfo | undefined {
    const shares = this.getShares();
    const share = shares.find((s) => s.shareToken === token);
    if (!share) return undefined;

    // 检查是否过期
    if (share.expiredAt) {
      const expDate = new Date(share.expiredAt);
      if (expDate.getTime() < Date.now()) {
        // 已过期
        return undefined;
      }
    }
    return share;
  }

  cancelShare(shareId: string) {
    let shares = this.getShares();
    shares = shares.filter((s) => s.id !== shareId);
    this.saveShares(shares);
  }

  // 常置全局静态文本字典
  getTextContent(fileId: string): string {
    return DEFAULT_TEXT_CONTENT;
  }
}

export const mockDB = new MockDB();
