/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface ClipboardItem {
  fileId: string;
  name: string;
  type: 'copy' | 'move';
}

interface UiState {
  viewMode: 'grid' | 'list';
  sidebarOpen: boolean;
  activeFileId: string | null;
  clipboard: ClipboardItem | null;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveFileId: (id: string | null) => void;
  setClipboard: (item: ClipboardItem | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  viewMode: 'grid',
  sidebarOpen: true,
  activeFileId: null,
  clipboard: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveFileId: (id) => set({ activeFileId: id }),
  setClipboard: (item) => set({ clipboard: item }),
}));
