/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '../types';

// 是否开启 Mock 模拟（第一阶段为 true，接真实后端改为 false）
const USE_MOCK = true;

// 模拟网络延迟（毫秒）
const MOCK_DELAY = 350;

/**
 * 统一网盘系统基础请求封装
 * 支持延迟、异常处理、ApiResponse 拼装，并为后续真实后端 API 请求注入 Token 拦截器
 */
export async function request<T>(options: {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  mockRunner: () => T;
}): Promise<ApiResponse<T>> {
  const { url, method, data, mockRunner } = options;

  if (USE_MOCK) {
    // 模拟网络延时
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    
    try {
      const result = mockRunner();
      return {
        code: 0,
        msg: 'success',
        data: result,
        success: true,
      };
    } catch (err: any) {
      console.warn(`[Mock API Handler Error] Path: ${method} ${url}`, err);
      return {
        code: 40099,
        msg: err.message || '操作失败',
        data: null as any,
        success: false,
        errorMsg: err.toString(),
      };
    }
  }

  // == 真实后端接入预留逻辑 ==
  const token = localStorage.getItem('netdisk_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const config: RequestInit = {
      method,
      headers,
    };
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json: ApiResponse<T> = await response.json();
    return json;
  } catch (error: any) {
    return {
      code: -1,
      msg: '网关或网络异常，请重试',
      data: null as any,
      success: false,
      errorMsg: error?.message || 'Network unreachable',
    };
  }
}
