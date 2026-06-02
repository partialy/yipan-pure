/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isInitialized, setAuth, clearAuth } = useAuthStore();

  // 用 Query 校验/同步服务端当前用户身份
  const { refetch: syncUser } = useQuery({
    queryKey: ['getCurrentUser'],
    queryFn: async () => {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setAuth(res.data, localStorage.getItem('netdisk_token') || '');
        return res.data;
      } else {
        clearAuth();
        return null;
      }
    },
    enabled: isInitialized && !!localStorage.getItem('netdisk_token'),
  });

  // 登录 Mutation
  const loginMutation = useMutation({
    mutationFn: (params: { username: string; password?: string }) => authService.login(params),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        queryClient.invalidateQueries({ queryKey: ['getCurrentUser'] });
        toast.success(`欢迎回来，${res.data.user.username}！`);
      } else {
        toast.error(res.msg || '登录失败，请重试');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || '网络连接失败');
    },
  });

  // 注册 Mutation
  const registerMutation = useMutation({
    mutationFn: (params: { username: string; email: string; password?: string }) =>
      authService.register(params),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('注册成功！可立即使用该邮箱登录');
      } else {
        toast.error(res.msg || '注册失败');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || '注册通道异常');
    },
  });

  // 退出 Mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('注销成功');
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    isInitialized,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    syncUser,
  };
}
