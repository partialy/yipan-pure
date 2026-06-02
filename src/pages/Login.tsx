/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {LoginForm} from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 若本来已登录，自动跳转至主目录
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/files');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (data: { username: string; password?: string }) => {
    try {
      await login(data);
      navigate('/dashboard/files');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 select-none">
      <div className="absolute inset-0 bg-radial-gradient from-blue-50/50 to-transparent pointer-events-none" />
      <LoginForm
        onSubmit={handleLoginSubmit}
        isLoading={isLoggingIn}
        onRegisterRedirect={handleRegisterRedirect}
      />
    </div>
  );
}
