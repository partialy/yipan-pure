/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDB } from '../mocks/mock-db';
import { User } from '../types';
import { request } from './request';

export interface LoginResult {
  token: string;
  user: User;
}

export const authService = {
  // 模拟登录
  login: async (params: { username: string; password?: string }) => {
    return request<LoginResult>({
      url: '/api/auth/login',
      method: 'POST',
      data: params,
      mockRunner: () => {
        const users = mockDB.getUsers();
        // 允许电子邮箱或用户名匹配
        const emailMatch = Object.keys(users).find(
          (email) => email.toLowerCase() === params.username.toLowerCase()
        );
        
        let targetEmail = '';
        let targetUsername = '';
        
        // 如果是邮箱匹配
        if (emailMatch) {
          const expectedPass = users[emailMatch];
          if (params.password !== expectedPass) {
            throw new Error('密码错误，请重新输入');
          }
          const username = emailMatch.split('@')[0];
          targetEmail = emailMatch;
          targetUsername = username.charAt(0).toUpperCase() + username.slice(1);
        } else {
          // 常规匹配 (如果输的是普通用户名)
          const matchedEmail = Object.keys(users).find(
            (email) => email.split('@')[0].toLowerCase() === params.username.toLowerCase()
          );
          if (matchedEmail) {
            const expectedPass = users[matchedEmail];
            if (params.password !== expectedPass) {
              throw new Error('密码错误，请重新输入');
            }
            targetEmail = matchedEmail;
            targetUsername = params.username.charAt(0).toUpperCase() + params.username.slice(1);
          } else {
            throw new Error('该账号/邮箱尚未注册');
          }
        }

        const mockUser: User = {
          id: `u-${Math.random().toString(36).substr(2, 6)}`,
          username: targetUsername,
          email: targetEmail,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${targetUsername}`,
          gender: 'keep_secret',
          birthday: '1998-10-12',
          bio: '这是一名神秘的网盘尊贵用户。',
          createdAt: '2026-01-15 14:32:01',
          lastLoginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        const fakeToken = `token_${Math.random().toString(36).substr(2, 10)}`;
        
        localStorage.setItem('netdisk_token', fakeToken);
        localStorage.setItem('netdisk_user', JSON.stringify(mockUser));
        return { token: fakeToken, user: mockUser };
      },
    });
  },

  // 模拟注册
  register: async (params: { username: string; email: string; password?: string }) => {
    return request<User>({
      url: '/api/auth/register',
      method: 'POST',
      data: params,
      mockRunner: () => {
        const users = mockDB.getUsers();
        if (users[params.email]) {
          throw new Error('该电子邮箱已被注册');
        }
        
        // 注册入库
        mockDB.addUser(params.email, params.password || '123456');

        return {
          id: `u-${Math.random().toString(36).substr(2, 6)}`,
          username: params.username,
          email: params.email,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${params.username}`,
          gender: 'keep_secret',
          birthday: '1998-10-12',
          bio: '本尊很懒，还没有填写个人简介。',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          lastLoginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      },
    });
  },

  // 获取当前正在登录的用户信息
  getCurrentUser: async () => {
    return request<User | null>({
      url: '/api/auth/me',
      method: 'GET',
      mockRunner: () => {
        const token = localStorage.getItem('netdisk_token');
        if (!token) return null;
        const userRaw = localStorage.getItem('netdisk_user');
        if (!userRaw) return null;
        
        const cachedUser: User = JSON.parse(userRaw);
        // 补充缺失的属性信息，保证界面优雅展示
        if (!cachedUser.id) cachedUser.id = 'u-default';
        if (!cachedUser.createdAt) cachedUser.createdAt = '2026-01-15 14:32:01';
        if (!cachedUser.lastLoginAt) cachedUser.lastLoginAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
        if (!cachedUser.gender) cachedUser.gender = 'keep_secret';
        if (!cachedUser.birthday) cachedUser.birthday = '1998-10-12';
        if (!cachedUser.bio) cachedUser.bio = '这是一名神秘的网盘尊贵用户。';
        
        return cachedUser;
      },
    });
  },

  // 修改资料 / 更新个人信息
  updateProfile: async (params: { 
    username: string; 
    email: string; 
    avatar?: string;
    gender?: 'male' | 'female' | 'other' | 'keep_secret';
    birthday?: string;
    bio?: string;
  }) => {
    return request<User>({
      url: '/api/auth/profile',
      method: 'PUT',
      data: params,
      mockRunner: () => {
        const userRaw = localStorage.getItem('netdisk_user');
        if (!userRaw) throw new Error('用户未登录或会话过期');
        const currentUser: User = JSON.parse(userRaw);
        const updatedUser: User = {
          ...currentUser,
          username: params.username,
          email: params.email,
          avatar: params.avatar || currentUser.avatar,
          gender: params.gender || currentUser.gender || 'keep_secret',
          birthday: params.birthday || currentUser.birthday || '1998-10-12',
          bio: params.bio !== undefined ? params.bio : currentUser.bio || '',
        };
        localStorage.setItem('netdisk_user', JSON.stringify(updatedUser));
        return updatedUser;
      },
    });
  },

  // 发送邮箱验证码
  sendEmailCode: async (params: { email: string }) => {
    return request<string>({
      url: '/api/auth/email/send-code',
      method: 'POST',
      data: params,
      mockRunner: () => {
        if (!params.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
          throw new Error('请输入正确的电子邮箱地址');
        }
        // 随机产生 6 位数字验证码
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // 存入 localStorage 以便下一步验证
        const codeData = {
          email: params.email,
          code,
          expires: Date.now() + 5 * 60 * 1000, // 5 分钟有效
        };
        localStorage.setItem('netdisk_email_verification', JSON.stringify(codeData));
        
        // 返回验证码（由于是前端仿真，我们同时使用 toast 或控制台显示它以供填写，这里作为数据直接返回）
        console.log(`[发送邮箱验证码成功] 邮箱: ${params.email}, 验证码: ${code}`);
        return code;
      },
    });
  },

  // 使用验证码修改电子邮箱
  updateEmail: async (params: { email: string; code: string }) => {
    return request<User>({
      url: '/api/auth/email/update',
      method: 'PUT',
      data: params,
      mockRunner: () => {
        const userRaw = localStorage.getItem('netdisk_user');
        if (!userRaw) throw new Error('用户未登录或会话过期');
        
        const verificationRaw = localStorage.getItem('netdisk_email_verification');
        if (!verificationRaw) {
          throw new Error('验证码未被发送或已过期');
        }
        
        const verification = JSON.parse(verificationRaw);
        if (verification.email.toLowerCase() !== params.email.toLowerCase()) {
          throw new Error('接收验证码的邮箱与新填写的邮箱不匹配');
        }
        if (verification.code !== params.code) {
          throw new Error('验证码不正确，请重新输入');
        }
        if (Date.now() > verification.expires) {
          throw new Error('验证码已过期，请重新发送');
        }
        
        // 验证通过，清除验证码记录
        localStorage.removeItem('netdisk_email_verification');
        
        // 更新用户信息
        const currentUser: User = JSON.parse(userRaw);
        const updatedUser: User = {
          ...currentUser,
          email: params.email,
        };
        
        // 并把邮箱密码表里面旧的置换一下，保证下一次能继续登录
        const users = mockDB.getUsers();
        const oldEmail = currentUser.email;
        if (oldEmail && users[oldEmail]) {
          const pass = users[oldEmail];
          // 删除旧账户映射，换新映射
          mockDB.addUser(params.email, pass);
          // 为防止删除，暂不随意移出以兼容其它老链接
        } else {
          mockDB.addUser(params.email, '123456');
        }

        localStorage.setItem('netdisk_user', JSON.stringify(updatedUser));
        return updatedUser;
      },
    });
  },

  // 注销登出
  logout: async () => {
    return request<null>({
      url: '/api/auth/logout',
      method: 'POST',
      mockRunner: () => {
        localStorage.removeItem('netdisk_token');
        localStorage.removeItem('netdisk_user');
        return null;
      },
    });
  },
};
