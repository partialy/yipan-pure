/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Providers } from './app/providers';
import { AppLayout } from './components/layout/AppLayout';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './stores/auth.store';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { PublicShare } from './pages/PublicShare';

// 路由拦截器：保护私有路由（如 /dashboard/* 必须先登录）
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-400">正在与云端存储芯片进行握手验证...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 强制跳转进入登录
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function MainAppRoutes() {
  const { initializeAuth, isInitialized } = useAuthStore();

  // 在界面加载之初同步身份密钥
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-400">正在与云端存储芯片进行握手验证...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. 公开端点 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/share/:shareToken" element={<PublicShare />} />

      {/* 2. 受保护的内部模块 */}
      <Route
        path="/dashboard/files"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/files/:folderId"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/recent"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/starred"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/shares"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/trash"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 3. 本地兜底和重定向规则 */}
      <Route path="/" element={<Navigate to="/dashboard/files" replace />} />
      <Route path="*" element={<Navigate to="/dashboard/files" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Providers>
      <Router>
        <MainAppRoutes />
      </Router>
    </Providers>
  );
}
