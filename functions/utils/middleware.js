/**
 * 中间件工具类 - 处理请求认证和错误处理
 */
import { verifyToken, checkPermission } from './supabase.js';

/**
 * 认证中间件 - 验证用户令牌
 * @param {Request} request - 请求对象
 * @returns {Promise<{user: Object|null, error: Error|null}>} 用户信息或错误
 */
export async function authenticate(request) {
  // 从请求头中获取认证令牌
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: new Error('未提供有效的认证令牌') };
  }
  
  const token = authHeader.split(' ')[1];
  return await verifyToken(token);
}

/**
 * 授权中间件 - 检查用户是否有权限访问资源
 * @param {Object} user - 用户对象
 * @param {string} resource - 资源标识符
 * @returns {Promise<{authorized: boolean, error: Error|null}>} 授权结果
 */
export async function authorize(user, resource) {
  if (!user) {
    return { authorized: false, error: new Error('未认证的用户') };
  }
  
  try {
    const hasPermission = await checkPermission(user, resource);
    if (!hasPermission) {
      return { authorized: false, error: new Error('无权访问该资源') };
    }
    
    return { authorized: true, error: null };
  } catch (error) {
    return { authorized: false, error };
  }
}

/**
 * 错误处理函数 - 将错误转换为标准响应格式
 * @param {Error} error - 错误对象
 * @param {number} statusCode - HTTP状态码
 * @returns {Response} 格式化的错误响应
 */
export function handleError(error, statusCode = 500) {
  const errorResponse = {
    success: false,
    error: error.message || '服务器内部错误',
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * 成功响应函数 - 创建标准格式的成功响应
 * @param {any} data - 响应数据
 * @param {number} statusCode - HTTP状态码
 * @returns {Response} 格式化的成功响应
 */
export function successResponse(data, statusCode = 200) {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * CORS中间件 - 处理跨域请求
 * @param {Response} response - 响应对象
 * @returns {Response} 添加了CORS头的响应
 */
export function addCorsHeaders(response) {
  const headers = new Headers(response.headers);
  
  // 添加CORS头
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * 处理预检请求
 * @returns {Response} 预检请求的响应
 */
export function handlePreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}