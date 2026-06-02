/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, '请输入注册账号或电子邮箱'),
  password: z
    .string()
    .min(6, '密码长度不能少于 6 个字符'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  isLoading: boolean;
  onRegisterRedirect: () => void;
}

export function LoginForm({ onSubmit, isLoading, onRegisterRedirect }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const handleFormSubmit = async (data: LoginFormValues) => {
    await onSubmit(data);
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-8 animate-fadeIn md:p-10">
      {/* Brand headers */}
      <div className="mb-8 select-none">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">登入个人云盘网盘</h2>
        <p className="text-xs text-slate-500 font-medium mt-1.5">
          请输入您的邮箱账号和密码以进入属于您的云端共享盘。
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* User / Email */}
        <div>
          <label htmlFor="login-username-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            邮箱账号 / 用户名
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              id="login-username-input"
              type="text"
              placeholder="请输入 pisamusic23@gmail.com 或 user"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border outline-none text-xs font-medium transition-all ${
                errors.username
                  ? 'border-red-500 focus:ring-1 focus:ring-red-400'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
              }`}
              {...register('username')}
            />
          </div>
          {errors.username && (
            <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="login-password-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              账户密码
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              id="login-password-input"
              type="password"
              placeholder="密码限制不少于 6 位 (初始测试：123456)"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border outline-none text-xs font-medium transition-all ${
                errors.password
                  ? 'border-red-500 focus:ring-1 focus:ring-red-400'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
              }`}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          id="login-submit-btn"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>正在验证身份...</span>
            </>
          ) : (
            <>
              <span>立即登录</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Toggle switch link */}
      <div className="mt-8 text-center border-t border-slate-100 pt-5 select-none">
        <p className="text-xs text-slate-500 font-medium">
          还没有网盘账号？{' '}
          <button
            type="button"
            onClick={onRegisterRedirect}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
            id="login-redirect-to-register"
          >
            免费注册一个专属密码
          </button>
        </p>
      </div>
    </div>
  );
}
