/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { shareService } from '../services/share.service';

export function usePublicShare(shareToken: string) {
  // 查询公开分享信息
  const query = useQuery({
    queryKey: ['publicShare', shareToken],
    queryFn: async () => {
      if (!shareToken) return null;
      const res = await shareService.getShareInfo(shareToken);
      if (res.success) {
        return res.data;
      }
      throw new Error(res.msg);
    },
    enabled: !!shareToken,
    retry: false, // 公开页如果找不到不一直重试
  });

  // 下载分享文件 Mutation
  const downloadMutation = useMutation({
    mutationFn: () => shareService.downloadSharedFile(shareToken),
    onSuccess: (res) => {
      if (res.success && res.data) {
        toast.success('正在触发下载，请稍候...');
        
        // 模拟真实文件流下载弹出
        if (res.data === 'text_content') {
          // 如果是 MD / TXT，可以生成一个本地 blob 虚拟下载
          const blob = new Blob(['## 模拟文件内容下载\n请放心，网盘假下载数据正常运作。'], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = query.data?.fileName || 'downloaded_file.md';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          // 如果是常规 http 链接，触发浏览器新标签页打开或点击
          const a = document.createElement('a');
          a.href = res.data;
          a.target = '_blank';
          a.referrerPolicy = 'no-referrer';
          a.download = query.data?.fileName || 'file';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        toast.error(res.msg || '获取下载地址失败');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || '系统下载异常，请刷新后重试');
    },
  });

  return {
    shareInfo: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    downloadFile: downloadMutation.mutateAsync,
    isDownloading: downloadMutation.isPending,
  };
}
