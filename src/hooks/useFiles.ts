/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery } from '@tanstack/react-query';
import { fileService } from '../services/file.service';
import { FileType } from '../types';

export function useFiles(params: {
  folderId?: string | null;
  keyword?: string;
  sortBy?: 'name' | 'size' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  type?: FileType | 'all';
}) {
  const { folderId, keyword, sortBy, sortOrder, type } = params;

  // React Query 服务端缓存，让过滤器/面包屑无缝联动
  const query = useQuery({
    queryKey: ['files', { folderId, keyword, sortBy, sortOrder, type }],
    queryFn: async () => {
      const res = await fileService.getFileList({
        folderId,
        keyword,
        sortBy,
        sortOrder,
        type,
      });
      if (res.success) {
        return res.data;
      }
      throw new Error(res.msg);
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
