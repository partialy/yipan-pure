/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fileService } from '../services/file.service';

export function useFileActions() {
  const queryClient = useQueryClient();

  const invalidateFiles = () => {
    queryClient.invalidateQueries({ queryKey: ['files'] });
  };

  // 创建文件夹 Mutation
  const createFolderMutation = useMutation({
    mutationFn: (params: { name: string; parentId: string | null }) =>
      fileService.createFolder(params),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(`文件夹 "${res.data.name}" 创建成功！`);
        invalidateFiles();
      } else {
        toast.error(res.msg || '文件夹创建失败，请确保没有同名文件夹');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || '操作异常');
    },
  });

  // 重命名 Mutation
  const renameMutation = useMutation({
    mutationFn: (params: { fileId: string; name: string }) =>
      fileService.renameFile(params.fileId, params.name),
    onSuccess: (res) => {
      if (res.success && res.data) {
        toast.success(`已重命名为 "${res.data.name}"`);
        invalidateFiles();
      } else {
        toast.error(res.msg || '命名失败，请检查同级是否存在重名');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || '重命名失败');
    },
  });

  // 删除文件/文件夹 Mutation (支持放入回收站或物理彻底删除)
  const deleteMutation = useMutation({
    mutationFn: (params: { fileId: string; permanent?: boolean }) =>
      fileService.deleteFile(params.fileId, params.permanent),
    onSuccess: (_, variables) => {
      if (variables.permanent) {
        toast.success('已从磁盘彻底物理删除');
      } else {
        toast.success('已移至回收站');
      }
      invalidateFiles();
    },
    onError: (err: any) => {
      toast.error(err.message || '删除发生错误');
    },
  });

  // 恢复删除的项 Mutation
  const restoreMutation = useMutation({
    mutationFn: (fileId: string) => fileService.restoreFile(fileId),
    onSuccess: () => {
      toast.success('选项已恢复成功');
      invalidateFiles();
    },
    onError: (err: any) => {
      toast.error(err.message || '恢复失败');
    },
  });

  // 星标收藏切换 Mutation
  const toggleStarMutation = useMutation({
    mutationFn: (fileId: string) => fileService.toggleStar(fileId),
    onSuccess: (res) => {
      if (res.success && res.data) {
        if (res.data.isStarred) {
          toast.success('星标成功，可在收藏中查看');
        } else {
          toast.success('已取消星标收藏');
        }
        invalidateFiles();
      } else {
        toast.error(res.msg || '操作异常');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || '收藏失败');
    },
  });

  return {
    createFolder: createFolderMutation.mutateAsync,
    isCreatingFolder: createFolderMutation.isPending,
    
    renameFile: renameMutation.mutateAsync,
    isRenaming: renameMutation.isPending,
    
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    restoreFile: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    
    toggleStar: toggleStarMutation.mutateAsync,
    isTogglingStar: toggleStarMutation.isPending,
  };
}
