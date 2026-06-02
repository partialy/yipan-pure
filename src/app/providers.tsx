/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { Toaster } from 'sonner';

// 全局 React Query 客户端配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 窗口聚焦不重新加载
      retry: false, // 不重试 Mock 请求
      staleTime: 60 * 1000, // 60s 缓存
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-center" 
        richColors 
        theme="light"
        toastOptions={{
          style: {
            fontFamily: '"Inter", sans-serif',
            borderRadius: '12px',
          }
        }}
      />
    </QueryClientProvider>
  );
}
