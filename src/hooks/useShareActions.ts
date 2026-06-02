/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { shareService } from '../services/share.service';

export function useShareActions() {
  const queryClient = useQueryClient();

  const invalidateMyShares = () => {
    queryClient.invalidateQueries({ queryKey: ['myShares'] });
  };

  // 生成分享记录 Mutation
  const createShareMutation = useMutation({
    mutationFn: (params: { fileId: string; expireType: 'forever' | '7d' | '30d' }) =>
      shareService.createShare(params.fileId, params.expireType),
    onSuccess: (res) => {
      if (res.success && res.data) {
        toast.success('分享链接生成成功！');
        invalidateMyShares();
      } else {
        toast.error(res.msg || '无法生成分享链接');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || '生成分享失败');
    },
  });

  // 取消分享 Mutation
  const cancelShareMutation = useMutation({
    mutationFn: (shareId: string) => shareService.cancelShare(shareId),
    onSuccess: () => {
      toast.success('分享链接已成功撤销');
      invalidateMyShares();
    },
    onError: (err: any) => {
      toast.error(err.message || '撤销失败');
    },
  });

  // 辅助函数：复制链接到剪贴板并 Toast 提示
  const copyShareLink = async (url: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success('链接已复制到剪贴板，快发给小伙伴吧！');
        return true;
      } else {
        // 兜底方案
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast.success('链接已复制到剪贴板，快发给小伙伴吧！');
        return true;
      }
    } catch (e) {
      toast.error('浏览器拒绝访问剪切板，请手动复制链接');
      return false;
    }
  };

  return {
    createShare: createShareMutation.mutateAsync,
    isCreatingShare: createShareMutation.isPending,
    
    cancelShare: cancelShareMutation.mutateAsync,
    isCanceling: cancelShareMutation.isPending,
    
    copyShareLink,
  };
}
