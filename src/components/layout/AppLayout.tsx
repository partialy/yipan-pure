/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Cloud,
  FileText,
  FolderOpen,
  LogOut,
  Menu,
  MenuSquare,
  Share2,
  Star,
  Trash2,
  Compass,
  Bell,
  Settings,
  X,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { useUiStore } from '../../stores/ui.store';
import { mockDB } from '../../mocks/mock-db';
import { formatBytes } from '../../lib/format';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUiStore();
  const [usedStorage, setUsedStorage] = useState(0);
  const totalStorage = 10 * 1024 * 1024 * 1024; // 10 GB
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Global click event to close user avatar dropdown
  useEffect(() => {
    const handleCloseDropdown = () => setUserDropdownOpen(false);
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  // 动态更新已经使用的网盘库大小
  useEffect(() => {
    const calcStorage = () => {
      const allFiles = mockDB.getFiles();
      // 只累加非删除的文件尺寸
      const sum = allFiles
        .filter((f) => f.type !== 'folder' && f.isDeleted !== true)
        .reduce((acc, curr) => acc + (curr.size || 0), 0);
      setUsedStorage(sum);
    };

    calcStorage();
    // 轮询或在触发文件列表变更时进行数据获取（这里每次路由重加载或者5秒自动算一次）
    const t = setInterval(calcStorage, 5000);
    return () => clearInterval(t);
  }, [location.pathname]);

  const percentage = Math.min(100, Math.round((usedStorage / totalStorage) * 100));

  const navItems = [
    {
      path: '/dashboard/files',
      label: '我的文件',
      icon: <FolderOpen size={16} />,
    },
    {
      path: '/dashboard/recent',
      label: '最近使用',
      icon: <Compass size={16} />,
    },
    {
      path: '/dashboard/starred',
      label: '我的收藏',
      icon: <Star size={16} />,
    },
    {
      path: '/dashboard/shares',
      label: '分享管理',
      icon: <Share2 size={16} />,
    },
    {
      path: '/dashboard/trash',
      label: '回收站',
      icon: <Trash2 size={16} />,
    },
    {
      path: '/dashboard/settings',
      label: '全局设置',
      icon: <Settings size={16} />,
    },
  ];

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleLogoClick = () => {
    navigate('/dashboard/files');
  };

  const currentPath = location.pathname;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden select-none">
      {/* 1. Left Sidebar desktop screen */}
      <aside
        className={`hidden md:flex w-64 border-r border-slate-200 bg-white flex-col h-full shrink-0 z-20 transition-all ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:px-0 md:border-r-0'
        }`}
      >
        {sidebarOpen && (
          <>
            {/* Logo branding */}
            <div
              onClick={handleLogoClick}
              className="p-6 flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Cloud size={18} strokeWidth={2.5} />
              </div>
              <span className="font-black text-slate-800 text-base tracking-tight shrink-0">
                CloudSphere
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                Lite
              </span>
            </div>

            {/* Sidebar nav lists */}
            <nav className="flex-1 px-4 space-y-1">
              {navItems.map((item) => {
                // 部分二级匹配逻辑
                const isActive =
                  currentPath === item.path ||
                  (item.path === '/dashboard/files' && currentPath.startsWith('/dashboard/files/'));

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 font-semibold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-3xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    id={`nav-link-${item.label}`}
                  >
                    <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Storage tracker progress panel */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/20">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                <span>云盘存储空余</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-none">
                {formatBytes(usedStorage)} of {formatBytes(totalStorage)}
              </p>
            </div>

            {/* Bottom user logout drawer bar */}
            <div className="hidden p-4 border-t border-slate-100 items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-200 shrink-0 bg-slate-150"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-150 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 bg-indigo-100">
                    JD
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold font-semibold text-slate-800 truncate" title={user?.username}>
                    {user?.username || 'Guest'}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate" title={user?.email}>
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer shrink-0"
                title="注销网盘"
                id="sidebar-logout-btn"
              >
                <LogOut size={14} />
              </button>
            </div>
          </>
        )}
      </aside>

      {/* 2. Left side drawers for reactive mobile screen */}
      <AnimatePresence>
        {!sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
              onClick={toggleSidebar}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xs"
            />

            {/* Panel */}
            <div className="relative w-64 bg-white flex flex-col h-full p-4 animate-slideRight">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white">
                    <Cloud size={14} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">CloudSphere</span>
                </div>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="p-1 border border-slate-200 text-slate-400 rounded-md"
                >
                  <X size={14} />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    currentPath === item.path ||
                    (item.path === '/dashboard/files' && currentPath.startsWith('/dashboard/files/'));
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        toggleSidebar();
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 font-semibold text-xs cursor-pointer ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="py-4 border-t border-slate-100 flex items-center justify-between gap-2.5 mt-5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.username?.substring(0, 2).toUpperCase() || 'JD'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {user?.username || 'John'}
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main content viewport section */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-3xs select-none">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer block"
              id="global-sidebar-toggle"
              title="折叠/显示侧边栏"
            >
              <Menu size={16} />
            </button>

            <span className="hidden sm:inline font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-150 px-2 py-1 rounded">
              Status: Live Dev Mode
            </span>
          </div>

          {/* Quick metrics info panel */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-colors rounded-lg cursor-pointer flex justify-center items-center relative"
              title="通知"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            <hr className="w-px h-6 bg-slate-200 inline" />

            <div className="relative">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="flex items-center gap-1.5 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left focus:outline-none"
                id="top-avatar-dropdown-trigger"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-slate-200 shrink-0 select-none bg-slate-50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 text-slate-705">
                    U
                  </div>
                )}
                <span className="hidden md:inline text-xs font-bold text-slate-700 select-none max-w-[100px] truncate">
                  {user?.username || 'Guest'}
                </span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 shrink-0 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Top-Right Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-1.5 overflow-hidden text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3.5 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">当前用户</p>
                      <p className="text-xs font-bold text-slate-800 truncate mt-1 leading-tight">{user?.username || 'Guest'}</p>
                      <p className="text-[10px] text-slate-400 truncate leading-normal mt-0.5">{user?.email || 'Guest user'}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/dashboard/settings?tab=profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <UserIcon size={14} className="text-slate-400" />
                      <span>修改资料</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate('/dashboard/settings?tab=system');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>个设与系统</span>
                    </button>

                    <hr className="my-1.5 border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogoutClick();
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={14} className="text-red-500" />
                      <span>退出登录</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content body layout viewport */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
