/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (newUser: User) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (user, token) => {
    localStorage.setItem('netdisk_token', token);
    localStorage.setItem('netdisk_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (newUser) => {
    localStorage.setItem('netdisk_user', JSON.stringify(newUser));
    set({ user: newUser });
  },

  clearAuth: () => {
    localStorage.removeItem('netdisk_token');
    localStorage.removeItem('netdisk_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const token = localStorage.getItem('netdisk_token');
    const userRaw = localStorage.getItem('netdisk_user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        set({ user, token, isAuthenticated: true, isInitialized: true });
        return;
      } catch (e) {
        localStorage.removeItem('netdisk_token');
        localStorage.removeItem('netdisk_user');
      }
    }
    set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
  },
}));
