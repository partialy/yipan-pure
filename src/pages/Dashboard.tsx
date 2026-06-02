/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FolderUp,
  FolderPlus,
  Compass,
  Star,
  Trash2,
  Settings as SettingsIcon,
  HardDrive,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Trash,
  RotateCcw,
  RefreshCw,
  Share2,
  Scissors,
  Clipboard,
  Mail,
  Upload,
  Calendar,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { FileDetailDrawer } from '../components/files/FileDetailDrawer';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { FileToolbar } from '../components/files/FileToolbar';
import { UploadProgressList } from '../components/files/UploadProgressList';

// Modal Dialog overlays
import { CreateFolderDialog } from '../components/files/CreateFolderDialog';
import { DeleteConfirmDialog } from '../components/files/DeleteConfirmDialog';
import { FilePreviewDialog } from '../components/files/FilePreviewDialog';
import { RenameDialog } from '../components/files/RenameDialog';
import { ShareDialog } from '../components/files/ShareDialog';
import { UploadDialog } from '../components/files/UploadDialog';

// Hooks and Stores
import { useFileActions } from '../hooks/useFileActions';
import { useFiles } from '../hooks/useFiles';
import { useMyShares } from '../hooks/useMyShares';
import { useShareActions } from '../hooks/useShareActions';
import { useAuth } from '../hooks/useAuth';
import { useUiStore } from '../stores/ui.store';
import { useUploadStore } from '../stores/upload.store';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';
import { FileItem, FileType } from '../types';
import { formatBytes, formatFriendlyDate } from '../lib/format';
import { mockDB } from '../mocks/mock-db';
import { fileService } from '../services/file.service';

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ folderId?: string }>();

  // Determine current contextual view scope
  let viewScope: 'files' | 'recent' | 'starred' | 'shares' | 'trash' | 'settings' = 'files';
  let targetFolderId: string | null = null; // null represents root under standard folder view

  const path = location.pathname;
  if (path.startsWith('/dashboard/recent')) {
    viewScope = 'recent';
    targetFolderId = '__recent__';
  } else if (path.startsWith('/dashboard/starred')) {
    viewScope = 'starred';
    targetFolderId = '__starred__';
  } else if (path.startsWith('/dashboard/trash')) {
    viewScope = 'trash';
    targetFolderId = '__trash__';
  } else if (path.startsWith('/dashboard/shares')) {
    viewScope = 'shares';
  } else if (path.startsWith('/dashboard/settings')) {
    viewScope = 'settings';
  } else {
    // files view
    viewScope = 'files';
    targetFolderId = params.folderId || null;
  }

  // Local query state variables
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'createdAt' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');

  // UI Zustand layout indicators and actions
  const { viewMode, setViewMode, activeFileId, setActiveFileId } = useUiStore();
  const { addUploadTask } = useUploadStore();

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch directory list with caching via TanStack Query
  const { data: fileResult, isLoading, refetch } = useFiles({
    folderId: targetFolderId,
    keyword,
    sortBy,
    sortOrder,
    type: filterType,
  });

  // Services mutations actions for files
  const { createFolder, renameFile, deleteFile, restoreFile, toggleStar } = useFileActions();

  // Dialog visual states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Focus resource payload holders
  const [focusedFile, setFocusedFile] = useState<FileItem | null>(null);

  // Clipboard state management
  const { clipboard, setClipboard } = useUiStore();
  const [bgContextMenu, setBgContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Profile management states
  const { updateUser: storeUpdateUser } = useAuthStore();
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileGender, setProfileGender] = useState<'male' | 'female' | 'other' | 'keep_secret'>('keep_secret');
  const [profileBirthday, setProfileBirthday] = useState('1998-10-12');
  const [profileBio, setProfileBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email validation & verification modal states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const PREMADE_AVATARS = [
    'https://api.dicebear.com/7.x/identicon/svg?seed=John',
    'https://api.dicebear.com/7.x/identicon/svg?seed=Alexa',
    'https://api.dicebear.com/7.x/identicon/svg?seed=Spark',
    'https://api.dicebear.com/7.x/identicon/svg?seed=Luna',
    'https://api.dicebear.com/7.x/identicon/svg?seed=Frost',
    'https://api.dicebear.com/7.x/identicon/svg?seed=Sunny',
    'https://api.dicebear.com/7.x/identicon/svg?seed=Flora',
    'https://api.dicebear.com/7.x/identicon/svg?seed=Nova',
  ];

  useEffect(() => {
    if (user) {
      setProfileUsername(user.username || '');
      setProfileEmail(user.email || '');
      setProfileAvatar(user.avatar || '');
      setProfileGender(user.gender || 'keep_secret');
      setProfileBirthday(user.birthday || '1998-10-12');
      setProfileBio(user.bio || '');
    }
  }, [user, viewScope]);

  // Handler for countdown interval
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Handle local Avatar load to Base64
  const handleLocalAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('只能选择图片文件！');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('头像图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileAvatar(reader.result);
        toast.success('本地图片加载预览成功！点击下方“保存更新”按钮提交保存');
      }
    };
    reader.readAsDataURL(file);
  };

  // Click to fetch the 60s countdown verification code
  const handleSendEmailCode = async () => {
    if (!newEmail.trim()) {
      toast.error('请输入新电子邮箱地址');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('电子邮箱地址格式不正确');
      return;
    }
    try {
      setIsSendingCode(true);
      const res = await authService.sendEmailCode({ email: newEmail });
      if (res.success && res.data) {
        setCountdown(60);
        toast.info(`验证码发送成功！测试环境验证码为: ${res.data}`, { duration: 10000 });
        setVerificationCode(res.data); // Autofill code for prototype convenience
      } else {
        toast.error(res.msg || '发送验证码失败');
      }
    } catch (err: any) {
      toast.error(err.message || '发送出错');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Trigger verify email update
  const handleConfirmEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error('请输入新邮箱地址');
      return;
    }
    if (!verificationCode.trim()) {
      toast.error('请输入验证码');
      return;
    }
    try {
      setIsVerifyingEmail(true);
      const res = await authService.updateEmail({
        email: newEmail,
        code: verificationCode,
      });
      if (res.success && res.data) {
        storeUpdateUser(res.data);
        setProfileEmail(res.data.email);
        toast.success(`电子邮箱更换成功！您的登录账户已变更为: ${res.data.email}`);
        setIsEmailModalOpen(false);
        setNewEmail('');
        setVerificationCode('');
        setCountdown(0);
      } else {
        toast.error(res.msg || '验证失败，请重新检查验证码');
      }
    } catch (err: any) {
      toast.error(err.message || '更换邮箱出错');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Save general profiles
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUsername.trim()) {
      toast.error('用户名不能为空');
      return;
    }
    try {
      setIsSavingProfile(true);
      const res = await authService.updateProfile({
        username: profileUsername,
        email: profileEmail,
        avatar: profileAvatar,
        gender: profileGender,
        birthday: profileBirthday,
        bio: profileBio,
      });
      if (res.success && res.data) {
        storeUpdateUser(res.data);
        toast.success('个人资料更改保存成功！');
      } else {
        toast.error(res.msg || '保存失败，请重试');
      }
    } catch (err: any) {
      toast.error(err.message || '更新个人信息出错，请重试');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Global mouse down listener to dismiss background context menu
  useEffect(() => {
    const handleGlobalClick = () => {
      setBgContextMenu(null);
    };
    window.addEventListener('mousedown', handleGlobalClick);
    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  const handleCopy = (file: FileItem) => {
    setClipboard({
      fileId: file.id,
      name: file.name,
      type: 'copy',
    });
    toast.success(`已加入剪贴板 (复制): ${file.name}`);
  };

  const handleCut = (file: FileItem) => {
    setClipboard({
      fileId: file.id,
      name: file.name,
      type: 'move',
    });
    toast.success(`已加入剪贴板 (剪切/移动): ${file.name}`);
  };

  const handlePasteSpecial = async (targetFolder: FileItem) => {
    if (targetFolder.type !== 'folder') return;
    await handlePaste(targetFolder.id);
  };

  const handlePaste = async (destinationFolderId: string | null = targetFolderId) => {
    if (!clipboard) {
      toast.error('剪贴板目前为空');
      return;
    }

    try {
      if (clipboard.type === 'copy') {
        await fileService.copyFile(clipboard.fileId, destinationFolderId);
        toast.success(`文件 "${clipboard.name}" 复制成功！`);
      } else {
        await fileService.moveFile(clipboard.fileId, destinationFolderId);
        toast.success(`文件 "${clipboard.name}" 移动成功！`);
        // Move cuts/clears clipboard
        setClipboard(null);
      }
      refetch();
    } catch (e: any) {
      toast.error(e?.message || '操作执行失败');
    }
  };

  // Shares lists query
  const { shares: myShares, refetch: reloadShares } = useMyShares();
  const { cancelShare, copyShareLink } = useShareActions();
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Sync right detailed drawer context when folder changes
  useEffect(() => {
    setActiveFileId(null);
    setIsDetailOpen(false);
  }, [location.pathname, setActiveFileId]);

  // Read currently selected file metadata
  const selectedFileItem =
    fileResult?.list.find((f) => f.id === activeFileId) || null;

  // Handles clicking a slot/card once -> selections highlight
  const handleSelectFile = (file: FileItem) => {
    if (file.type === 'folder' && viewScope !== 'trash') {
      navigate(`/dashboard/files/${file.id}`);
    } else {
      setActiveFileId(file.id);
    }
  };

  const handleOpenDetail = (file: FileItem) => {
    setActiveFileId(file.id);
    setIsDetailOpen(true);
  };

  // Handles entering folder (double click) or previewing non-folders
  const handleDoubleClick = (file: FileItem) => {
    if (file.type === 'folder') {
      navigate(`/dashboard/files/${file.id}`);
    } else {
      if (viewScope === 'trash') {
        toast.error('处于回收站中的文件无法直接进行预览，请先将其还原');
        return;
      }
      setFocusedFile(file);
      setIsPreviewModalOpen(true);
    }
  };

  // Trigger contextual file level download
  const handleDownloadFile = (file: FileItem) => {
    if (file.type === 'folder') return;
    toast.success(`开始触发下载: ${file.name}`);
    
    if (file.downloadUrl === 'text_content') {
      const blob = new Blob([mockDB.getTextContent(file.id)], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (file.downloadUrl) {
      const a = document.createElement('a');
      a.href = file.downloadUrl;
      a.target = '_blank';
      a.referrerPolicy = 'no-referrer';
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Modal actions triggers
  const handleOpenRename = (file: FileItem) => {
    setFocusedFile(file);
    setIsRenameModalOpen(true);
  };

  const handleOpenDeleteConfirm = (file: FileItem) => {
    setFocusedFile(file);
    setIsDeleteModalOpen(true);
  };

  const handleOpenShare = (file: FileItem) => {
    setFocusedFile(file);
    setIsShareModalOpen(true);
  };

  const handleToggleStarClick = async (file: FileItem) => {
    await toggleStar(file.id);
  };

  const handleRestoreClick = async (file: FileItem) => {
    await restoreFile(file.id);
  };

  // Action logic runners
  const handleFolderSubmit = async (folderName: string) => {
    try {
      await createFolder({ name: folderName, parentId: targetFolderId });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenameSubmit = async (newName: string) => {
    if (focusedFile) {
      try {
        await renameFile({ fileId: focusedFile.id, name: newName });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteConfirm = async (permanent: boolean) => {
    if (focusedFile) {
      try {
        await deleteFile({ fileId: focusedFile.id, permanent });
        if (activeFileId === focusedFile.id) {
          setActiveFileId(null);
          setIsDetailOpen(false);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUploadTrigger = (fileName: string, size: number) => {
    // Add upload progression bar to zustand queues
    addUploadTask(fileName, size, targetFolderId, () => {
      // 在上传成功之后 invalidate React query files list
      refetch();
    });
  };

  const handleCopyShareClick = async (shareId: string, url: string) => {
    const success = await copyShareLink(url);
    if (success) {
      setCopiedShareId(shareId);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    await cancelShare(shareId);
    reloadShares();
  };

  // Resets local storage database mock files to fresh factory seed
  const resetDatabaseAction = () => {
    localStorage.removeItem('netdisk_files');
    localStorage.removeItem('netdisk_shares');
    toast.success('数据重置成功，系统初始文件库已还原！');
    refetch();
    reloadShares();
  };

  return (
    <div className="flex-1 flex overflow-hidden min-h-0 relative select-none">
      {/* Dynamic Main Center viewport */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 flex flex-col min-h-0">
        
        {/* Render A: Directory files flow */}
        {(viewScope === 'files' || viewScope === 'recent' || viewScope === 'starred' || viewScope === 'trash') && (
          <>
            {/* Folder Toolbars and breadcrumbs */}
            <FileToolbar
              breadcrumbs={fileResult?.breadcrumbs || [{ id: null, name: '主目录' }]}
              onBreadcrumbClick={(id) => {
                if (viewScope === 'files') {
                  if (id) navigate(`/dashboard/files/${id}`);
                  else navigate(`/dashboard/files`);
                }
              }}
              keyword={keyword}
              onKeywordChange={setKeyword}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              filterType={filterType}
              onFilterTypeChange={setFilterType}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onUploadClick={() => setIsUploadModalOpen(true)}
              onCreateFolderClick={() => setIsFolderModalOpen(true)}
              isTrashView={viewScope === 'trash'}
            />

            {/* Empty state loaders or lists */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-slate-400">正在与云端服务器进行密匙同步...</p>
              </div>
            ) : fileResult?.list.length === 0 ? (
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-10 bg-white">
                <HardDrive className="text-slate-300 mb-3" size={40} />
                <h3 className="font-bold text-slate-800 text-sm">此目录下空空如也</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs text-center leading-normal">
                  {viewScope === 'trash'
                    ? '回收站目前极为干净整洁，没有保存任何已被放入删除的目标资源。'
                    : '目前尚无资源，您可以点击右上方 "上传文件" 选项进行高保真进度仿真。'}
                </p>
                {viewScope === 'files' && (
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-6 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    开始模拟上传
                  </button>
                )}
              </div>
            ) : (
              <div
                className="flex-1 min-h-0 min-w-0"
                onContextMenu={(e) => {
                  if (clipboard && viewScope === 'files') {
                    // Prevent standard browser context menu on layout background if clipboard is filled
                    e.preventDefault();
                    setBgContextMenu({ x: e.clientX, y: e.clientY });
                  }
                }}
              >
                {viewMode === 'grid' ? (
                  <FileGrid
                    files={fileResult?.list || []}
                    selectedId={activeFileId}
                    onSelect={handleSelectFile}
                    onDoubleClick={handleDoubleClick}
                    onContextMenuSelect={(file) => setActiveFileId(file.id)}
                    onPreview={handleDoubleClick}
                    onShare={handleOpenShare}
                    onRename={handleOpenRename}
                    onDelete={handleOpenDeleteConfirm}
                    onRestore={viewScope === 'trash' ? handleRestoreClick : undefined}
                    onStar={handleToggleStarClick}
                    onDownload={handleDownloadFile}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    onPasteSpecial={handlePasteSpecial}
                    onOpenDetail={handleOpenDetail}
                    canPaste={!!clipboard}
                    isTrashView={viewScope === 'trash'}
                  />
                ) : (
                  <FileList
                    files={fileResult?.list || []}
                    selectedId={activeFileId}
                    onSelect={handleSelectFile}
                    onDoubleClick={handleDoubleClick}
                    onContextMenuSelect={(file) => setActiveFileId(file.id)}
                    onPreview={handleDoubleClick}
                    onShare={handleOpenShare}
                    onRename={handleOpenRename}
                    onDelete={handleOpenDeleteConfirm}
                    onRestore={viewScope === 'trash' ? handleRestoreClick : undefined}
                    onStar={handleToggleStarClick}
                    onDownload={handleDownloadFile}
                    onCopy={handleCopy}
                    onCut={handleCut}
                    onPasteSpecial={handlePasteSpecial}
                    onOpenDetail={handleOpenDetail}
                    canPaste={!!clipboard}
                    isTrashView={viewScope === 'trash'}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Render B: Custom Shares Management dashboard view */}
        {viewScope === 'shares' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-3xs">
              <h2 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Share2 size={16} className="text-blue-500 font-bold" /> 自助链接分享管理中心
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                下面列出了您历史为主文件夹资源生成的全部分享链。被公开分享的链接在过期或自主撤回取消之前，任何人均可以直接点击下载。
              </p>
            </div>

            {myShares.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white flex flex-col items-center">
                <Share2 size={36} className="text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">未找到分享资产</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  您目前未为主文件夹下的文件生成任何公开下载通道。可以在常规文件目录的右键或操作浮层中一键生成极速分享！
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myShares.map((share) => (
                  <div
                    key={share.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-2xs transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                          {share.fileType.toUpperCase()} FORMAT
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm truncate mt-1.5" title={share.fileName}>
                          {share.fileName}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">大小：{formatBytes(share.fileSize)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevokeShare(share.id)}
                        className="p-1 px-2 border border-red-250 text-red-500 bg-red-50 hover:bg-red-100/50 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                        title="取消公开分享，立即关闭下载通道"
                        id={`revoke-share-${share.id}`}
                      >
                        撤销分享
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        分享地址链接 (公开免密)
                      </span>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          readOnly
                          value={share.shareUrl}
                          className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500 font-mono outline-none select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyShareClick(share.id, share.shareUrl)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 w-8"
                          title="复制极速链接"
                        >
                          {copiedShareId === share.id ? (
                            <ClipboardCheck size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> 建立: {formatFriendlyDate(share.createdAt)}
                      </span>
                      <span>
                        有效期: {share.expireType === 'forever' ? '永久有效' : share.expireType === '7d' ? '7天' : '30天'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render C: Settings profile database views */}
        {viewScope === 'settings' && (() => {
          const queryParams = new URLSearchParams(location.search);
          const settingsTab = queryParams.get('tab') || 'profile';

          return (
            <div className="space-y-6 w-full max-w-4xl mx-auto px-4 select-none animate-fadeIn">
              {/* Header Description */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-3xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-md font-bold text-slate-900 flex items-center gap-2">
                    <SettingsIcon size={16} className="text-blue-500 font-bold" /> 个人与系统开发设置
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    修改您登录账户的个人资料，或者重置管理本仿真演示网盘的数据集。
                  </p>
                </div>

                {/* Tab selector */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/settings?tab=profile')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      settingsTab === 'profile'
                        ? 'bg-white text-slate-900 shadow-3xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    修改个人资料
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/settings?tab=system')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      settingsTab === 'system'
                        ? 'bg-white text-slate-900 shadow-3xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    系统控制台
                  </button>
                </div>
              </div>

              {/* Profile Tab Section */}
              {settingsTab === 'profile' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-3xs">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6 flex items-center justify-between">
                    <span>个人账户基本资料管理</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-105 px-2 py-0.5 rounded-sm">
                      账户类型: OWNER
                    </span>
                  </h3>
                  
                  <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Read-only metadata badge row */}
                    <div className="md:col-span-3 bg-[#fafbfc] rounded-xl border border-slate-150 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">用户 UUID (系统自创)</span>
                        <code className="text-slate-600 font-mono select-all break-all text-[11px] font-semibold bg-slate-100 border border-slate-200/60 px-1.5 py-1 rounded inline-block w-full truncate" title={user?.id || 'u-default'}>
                          {user?.id || 'u-default'}
                        </code>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">注册加入时间</span>
                        <div className="text-slate-600 font-semibold flex items-center h-[26px]">
                          <Clock size={12} className="text-slate-400 shrink-0 mr-1.5" />
                          <span>{user?.createdAt || '2026-01-15 14:32:01'}</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">上次登录时间</span>
                        <div className="text-slate-600 font-semibold flex items-center h-[26px]">
                          <Compass size={12} className="text-slate-400 shrink-0 mr-1.5" />
                          <span>{user?.lastLoginAt || '2026-06-02 10:59:00'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Left Column: Avatar editing with local upload support */}
                    <div className="flex flex-col items-center space-y-4 md:border-r md:border-slate-100 md:pr-8">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest self-start md:self-center">
                        用户头像配置
                      </span>
                      <div className="relative group select-none">
                        {profileAvatar ? (
                          <img
                            src={profileAvatar}
                            alt="Avatar Preview"
                            referrerPolicy="no-referrer"
                            className="w-24 h-24 rounded-full border-2 border-slate-100 group-hover:border-blue-500 transition-all shadow-md bg-slate-50 p-1 object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-slate-105 flex items-center justify-center font-bold text-2xl text-slate-500 border border-slate-250 shadow-inner">
                            U
                          </div>
                        )}
                        <label className="absolute inset-1 rounded-full bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                          <Upload size={16} className="mb-0.5 animate-bounce" />
                          <span className="text-[9px] font-bold">选择本地图片</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLocalAvatarUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="flex flex-col items-center w-full gap-2">
                        <label className="px-3 py-1.5 bg-slate-105 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors border border-slate-250 shadow-3xs">
                          <Upload size={13} className="text-slate-550" />
                          <span>上传本地头像</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLocalAvatarUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400 text-center leading-normal">
                          支持 JPG、PNG、SVG 等图片格式，文件建议不超过 2MB
                        </p>
                      </div>
                      
                      <div className="w-full border-t border-slate-100 pt-3 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          或挑选系统推荐预设
                        </span>
                        
                        {/* Premade avatar grid picker */}
                        <div className="grid grid-cols-4 gap-2 w-full max-w-[190px]">
                          {PREMADE_AVATARS.map((avatarUrl, idx) => {
                            const isSelected = profileAvatar === avatarUrl;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setProfileAvatar(avatarUrl)}
                                className={`w-9 h-9 rounded-full border-2 overflow-hidden transition-all cursor-pointer p-0.5 bg-white ${
                                  isSelected
                                    ? 'border-blue-600 ring-2 ring-blue-100 scale-105'
                                    : 'border-transparent hover:border-slate-300'
                                }`}
                              >
                                <img src={avatarUrl} alt={`Avatar Pro ${idx}`} className="w-full h-full rounded-full" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Text properties inputs */}
                    <div className="md:col-span-2 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
                            登录用户名
                          </label>
                          <input
                            type="text"
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value)}
                            placeholder="您的属主专属名称"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 bg-[#f8fafc]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                            <span>我的电子邮箱</span>
                            <span className="text-[10px] text-blue-500 font-bold">点击右侧按钮更换</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="email"
                              disabled
                              value={profileEmail}
                              className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 cursor-not-allowed select-all font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setNewEmail('');
                                setVerificationCode('');
                                setIsEmailModalOpen(true);
                              }}
                              title="点击修改关联邮箱"
                              className="absolute right-2 p-1.5 hover:bg-slate-200 rounded text-blue-600 transition-colors cursor-pointer flex items-center justify-center"
                              id="avatar-email-edit-btn"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path fill="currentColor" d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2" />
                                <path fill="currentColor" d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7L17.5 8.09L15.91 6.5zm-8 8l5.5-5.5l1.59 1.59l-5.5 5.5H9z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
                            性别
                          </label>
                          <select
                            value={profileGender}
                            onChange={(e: any) => setProfileGender(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 bg-[#f8fafc]"
                          >
                            <option value="keep_secret">保密 🔒</option>
                            <option value="male">男 ♂</option>
                            <option value="female">女 ♀</option>
                            <option value="other">其它 🌈</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                            <Calendar size={13} className="text-slate-400 shrink-0" />
                            <span>生日出生日期</span>
                          </label>
                          <input
                            type="date"
                            value={profileBirthday}
                            onChange={(e) => setProfileBirthday(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 bg-[#f8fafc]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">
                          简介描述
                        </label>
                        <textarea
                          rows={3}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="写下几句心里话或个性的个人备考、生活简介吧..."
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 bg-[#f8fafc] resize-none"
                        />
                      </div>



                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 font-sans"
                        >
                          {isSavingProfile ? (
                            <>
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              <span>保存中...</span>
                            </>
                          ) : (
                            <span>保存更新</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* System settings pane (original) */}
              {settingsTab === 'system' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account properties card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-3xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                      当前登录账户底座
                    </h3>
                    <div className="flex items-center gap-4">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-12 h-12 rounded-full border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-150 flex items-center justify-center font-bold">
                          U
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{user?.username}</h4>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-150 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                          ROLE: OWNER
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs leading-normal">
                      <p className="text-slate-600">
                        本系统使用 <strong>LocalStorage</strong> 进行数据高真模拟持久化。当您退出或刷新页面时，创建、重命名、删除或星标的文件状态将完整保留！
                      </p>
                    </div>
                  </div>

                  {/* Development resetting tools */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-3xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                      重置物理演示数据
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      如果您在调试过程中错误清空了所有文件导致列表空白，可以点击下方按钮，以便一键擦除 LocalStorage 内的所有数据记录，并初始化回最原始的精选网盘演示。
                    </p>

                    <button
                      type="button"
                      onClick={resetDatabaseAction}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer w-full flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw size={14} /> 还原出厂种子文件
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Render D: Optional lateral file detail attributes sidebar drawer */}
      {viewScope !== 'shares' && viewScope !== 'settings' && (
        <FileDetailDrawer
          isOpen={isDetailOpen && !!activeFileId}
          onClose={() => setIsDetailOpen(false)}
          file={selectedFileItem}
          onDownload={() => selectedFileItem && handleDownloadFile(selectedFileItem)}
          onDeleteClick={() => selectedFileItem && handleOpenDeleteConfirm(selectedFileItem)}
          onCopy={() => selectedFileItem && handleCopy(selectedFileItem)}
          onCut={() => selectedFileItem && handleCut(selectedFileItem)}
          onPasteSpecial={() => selectedFileItem && handlePasteSpecial(selectedFileItem)}
          canPaste={!!clipboard}
        />
      )}

      {/* Floating Clipboard Status Banner */}
      {clipboard && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 z-50 animate-slideUp">
          <div className="flex flex-col min-w-0 max-w-[180px]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              已{clipboard.type === 'copy' ? '复制' : '剪切 / 移动'}
            </span>
            <span className="text-xs font-semibold truncate block mt-0.5" title={clipboard.name}>
              {clipboard.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handlePaste()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-505 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm text-white"
            >
              <Clipboard size={12} /> 粘贴至当前
            </button>
            <button
              onClick={() => setClipboard(null)}
              className="px-2 py-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              清除
            </button>
          </div>
        </div>
      )}

      {/* Background paste context menu portal */}
      {bgContextMenu && clipboard && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${bgContextMenu.x}px`,
            top: `${bgContextMenu.y}px`,
            width: '160px',
          }}
          className="rounded-xl border border-slate-200 bg-white shadow-lg z-[9999] py-1.5 animate-fadeIn text-left select-none animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              handlePaste();
              setBgContextMenu(null);
            }}
            className="w-full px-4 py-2 text-xs font-bold text-slate-705 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors text-slate-700"
          >
            <Clipboard size={14} className="text-emerald-500 hover:bg-slate-50" />
            <span>粘贴至此目录</span>
          </button>
        </div>,
        document.body
      )}

      {/* Mounting floating upload progress indicators component */}
      <UploadProgressList />

      {/* ========================================================= */}
      {/* ======================= MOUNT DIALOGS =================== */}
      {/* ========================================================= */}

      {/* Folder Creation Form Dialog */}
      <CreateFolderDialog
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSubmit={handleFolderSubmit}
        isLoading={false}
      />

      {/* Renaming Form Dialog */}
      <RenameDialog
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onSubmit={handleRenameSubmit}
        initialName={focusedFile?.name || ''}
        isLoading={false}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        fileName={focusedFile?.name || ''}
        isTrashView={viewScope === 'trash'}
        isLoading={false}
      />

      {/* Upload Drag zone dialog */}
      <UploadDialog
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadTrigger}
      />

      {/* Sharing generation card dialog */}
      <ShareDialog
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fileId={focusedFile?.id || ''}
        fileName={focusedFile?.name || ''}
        onShareCreated={() => reloadShares()}
      />

      {/* Core Rich formats preview screen card dialog */}
      <FilePreviewDialog
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setFocusedFile(null);
        }}
        fileId={focusedFile?.id || null}
        fileName={focusedFile?.name || ''}
        onDownload={() => focusedFile && handleDownloadFile(focusedFile)}
      />

      {/* Email verification Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl border border-slate-250 shadow-2xl p-6 w-full max-w-sm mx-4 relative animate-scaleUp">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Mail size={16} className="text-blue-500" /> 修改绑定邮箱安全验证
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              为了关联新账号安全性，更换绑定邮箱需要向新邮箱发送 6 位数一次性系统分发密匙。
            </p>
            
            <form onSubmit={handleConfirmEmailUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  请输入新电子邮箱地址
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="例如: example@domain.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 bg-[#f8fafc]"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                  邮箱安全核验验证码
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="请输入 6 位验证码"
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-blue-500 bg-[#f8fafc] text-center tracking-widest text-slate-800"
                  />
                  <button
                    type="button"
                    disabled={countdown > 0 || isSendingCode}
                    onClick={handleSendEmailCode}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0 min-w-[100px]"
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : isSendingCode ? '发送中...' : '发送验证码'}
                  </button>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailModalOpen(false);
                    setNewEmail('');
                    setVerificationCode('');
                    setCountdown(0);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-150 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingEmail || !newEmail || !verificationCode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isVerifyingEmail ? '核验中...' : '确认更换绑定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Dashboard;
