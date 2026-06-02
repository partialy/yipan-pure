/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChevronRight,
  FolderPlus,
  LayoutGrid,
  List,
  Search,
  Upload,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import React from 'react';
import { BreadcrumbItem, FileType } from '../../types';

interface FileToolbarProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (id: string | null) => void;
  
  keyword: string;
  onKeywordChange: (val: string) => void;
  
  sortBy: 'name' | 'size' | 'createdAt' | 'updatedAt';
  onSortByChange: (val: 'name' | 'size' | 'createdAt' | 'updatedAt') => void;
  
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (val: 'asc' | 'desc') => void;
  
  filterType: FileType | 'all';
  onFilterTypeChange: (val: FileType | 'all') => void;
  
  viewMode: 'grid' | 'list';
  onViewModeChange: (val: 'grid' | 'list') => void;
  
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  
  isTrashView?: boolean;
}

export function FileToolbar({
  breadcrumbs,
  onBreadcrumbClick,
  keyword,
  onKeywordChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  filterType,
  onFilterTypeChange,
  viewMode,
  onViewModeChange,
  onUploadClick,
  onCreateFolderClick,
  isTrashView = false,
}: FileToolbarProps) {
  return (
    <div className="space-y-4 pb-4 select-none">
      {/* Row 1: Breadcrumb Path and Layout CTA Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none min-w-0">
          {breadcrumbs.map((node, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={node.id || 'root-bread'}>
                {idx > 0 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                <button
                  type="button"
                  onClick={() => onBreadcrumbClick(node.id)}
                  disabled={isLast}
                  className={`text-sm shrink-0 font-bold transition-colors cursor-pointer ${
                    isLast
                      ? 'text-slate-800'
                      : 'text-slate-400 hover:text-blue-600'
                  }`}
                >
                  {node.name}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action CTAs (Disabled on Trash scopes) */}
        {!isTrashView && (
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            {/* New folder button */}
            <button
              type="button"
              onClick={onCreateFolderClick}
              className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-3xs"
              id="new-folder-cta"
            >
              <FolderPlus size={14} className="text-amber-500" />
              <span>新建文件夹</span>
            </button>

            {/* Upload files button */}
            <button
              type="button"
              onClick={onUploadClick}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              id="upload-files-cta"
            >
              <Upload size={14} />
              <span>上传文件</span>
            </button>
          </div>
        )}
      </div>

      {/* Row 2: Search filters and sorting layout selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="在当前目录下搜索资源..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 px-3.5 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white text-xs text-slate-700 font-medium transition-all shadow-3xs"
            id="toolbar-search-input"
          />
        </div>

        {/* Interactive Filtering Options */}
        <div className="flex items-center flex-wrap gap-2 justify-end">
          {/* Files type filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-3xs text-xs gap-1.5 font-semibold text-slate-500">
            <Filter size={13} />
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value as FileType | 'all')}
              className="bg-transparent border-none outline-none text-xs text-slate-650 cursor-pointer text-slate-705"
              id="toolbar-type-filter"
            >
              <option value="all">全部格式</option>
              <option value="folder">文件夹</option>
              <option value="image">图片格式</option>
              <option value="pdf">PDF 资源</option>
              <option value="text">文本 / Markdown</option>
              <option value="video">视频文件</option>
              <option value="audio">音频流</option>
            </select>
          </div>

          {/* Sort selection drop dropdown */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-3xs text-xs gap-1.5 font-semibold text-slate-500">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-transparent border-none outline-none text-xs text-slate-705 cursor-pointer"
              id="toolbar-sort-by"
            >
              <option value="name">按名称排列</option>
              <option value="size">按文件大小</option>
              <option value="updatedAt">按更新时间</option>
              <option value="createdAt">按创建时间</option>
            </select>
          </div>

          {/* Sort order quick toggle */}
          <button
            type="button"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 bg-white transition-colors shadow-3xs"
            title={sortOrder === 'asc' ? '升序排列' : '降序排列'}
            id="toolbar-sort-order-toggle"
          >
            <span className="text-[10px] font-bold px-1 uppercase tracking-wide">
              {sortOrder === 'asc' ? '升序' : '降序'}
            </span>
          </button>

          {/* View mode selectors */}
          <div className="flex border border-slate-200 bg-white rounded-lg p-0.5 shadow-3xs shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="网格视图"
              id="trigger-grid-view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="列表视图"
              id="trigger-list-view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
