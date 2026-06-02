/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, User, Loader2, ArrowRight } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, '用户名不能少于 2 个字符')
      .max(20, '用户名太长了'),
    email: z
      .string()
      .trim()
      .min(1, '电子邮箱是必填项')
      .email('请输入合法的电子邮箱格式'),
    password: z
      .string()
      .min(6, '密码安全性低，不能少于 6 位'),
    confirmPassword: z
      .string()
      .min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  isLoading: boolean;
  onLoginRedirect: () => void;
}

export function RegisterForm({ onSubmit, isLoading, onLoginRedirect }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const handleFormSubmit = async (data: RegisterFormValues) => {
    await onSubmit(data);
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-8 animate-fadeIn md:p-10">
      <div className="mb-8 select-none">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">注册创建网盘账户</h2>
        <p className="text-xs text-slate-500 font-medium mt-1.5">
          创建属于您独立加密的个人网盘空间，保存所有重要的数字资产。
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label htmlFor="reg-username-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            用户昵称 / 姓名
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              id="reg-username-input"
              type="text"
              placeholder="例如：Alice Wood"
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

        {/* Email */}
        <div>
          <label htmlFor="reg-email-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            注册电子邮箱
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              id="reg-email-input"
              type="email"
              placeholder="例如：user@example.com"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border outline-none text-xs font-medium transition-all ${
                errors.email
                  ? 'border-red-500 focus:ring-1 focus:ring-red-400'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
              }`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            设置账户密码
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              id="reg-password-input"
              type="password"
              placeholder="不少于 6 位数密码"
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

        {/* Confirm password */}
        <div>
          <label htmlFor="reg-confirm-input" className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            确认输入密码
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              id="reg-confirm-input"
              type="password"
              placeholder="请重复上方输入密码"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border outline-none text-xs font-medium transition-all ${
                errors.confirmPassword
                  ? 'border-red-500 focus:ring-1 focus:ring-red-400'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
              }`}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 mt-2"
          id="register-submit-btn"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>正在创建专属密码...</span>
            </>
          ) : (
            <>
              <span>立即注册</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-slate-100 pt-5 select-none">
        <p className="text-xs text-slate-500 font-medium">
          已经拥有网盘账户？{' '}
          <button
            type="button"
            onClick={onLoginRedirect}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
            id="register-redirect-to-login"
          >
            直接返回登录
          </button>
        </p>
      </div>
    </div>
  );
}
