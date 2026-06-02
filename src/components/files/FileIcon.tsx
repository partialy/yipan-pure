/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
} from 'lucide-react';
import React from 'react';
import { FileType } from '../../types';

interface FileIconProps {
  type: FileType;
  className?: string;
  size?: number;
}

export function FileIcon({ type, className = '', size = 24 }: FileIconProps) {
  switch (type) {
    case 'folder':
      return <Folder className={`text-amber-500 fill-amber-500/20 ${className}`} size={size} />;
    case 'image':
      return <FileImage className={`text-emerald-500 ${className}`} size={size} />;
    case 'pdf':
      return <FileText className={`text-rose-500 ${className}`} size={size} />;
    case 'text':
      return <FileCode className={`text-blue-500 ${className}`} size={size} />;
    case 'video':
      return <FileVideo className={`text-indigo-500 ${className}`} size={size} />;
    case 'audio':
      return <FileAudio className={`text-purple-500 ${className}`} size={size} />;
    case 'document':
      return <FileText className={`text-sky-500 ${className}`} size={size} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={`text-teal-500 ${className}`} size={size} />;
    case 'presentation':
      return <FileSpreadsheet className={`text-orange-500 ${className}`} size={size} />;
    default:
      return <File className={`text-slate-400 ${className}`} size={size} />;
  }
}
