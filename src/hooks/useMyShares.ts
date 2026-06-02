/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery } from '@tanstack/react-query';
import { shareService } from '../services/share.service';

export function useMyShares() {
  const query = useQuery({
    queryKey: ['myShares'],
    queryFn: async () => {
      const res = await shareService.getMyShares();
      if (res.success) {
        return res.data;
      }
      throw new Error(res.msg);
    },
  });

  return {
    shares: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
