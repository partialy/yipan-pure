/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery } from '@tanstack/react-query';
import { fileService } from '../services/file.service';

export function useFilePreview(fileId: string | null) {
  const query = useQuery({
    queryKey: ['filePreview', fileId],
    queryFn: async () => {
      if (!fileId) return null;
      const res = await fileService.getPreviewInfo(fileId);
      if (res.success) {
        return res.data;
      }
      throw new Error(res.msg);
    },
    enabled: !!fileId,
  });

  return {
    previewInfo: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
