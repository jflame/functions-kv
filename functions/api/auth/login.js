/**
 * 用户认证API - 登录
 * 处理用户登录请求，返回JWT令牌
 */
import { supabase } from '../../utils/supabase.js';
import { handleError, successResponse, addCorsHeaders, handlePreflight } from '../../utils/middleware.js';

/**
 * 处理登录请求
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handleLoginRequest(request) {
  try {
    // 处理OPTIONS请求（预检请求）
    if (request.method === 'OPTIONS') {
      return handlePreflight();
    }
    
    // 只接受POST请求
    if (request.method !== 'POST') {
      return handleError(new Error('方法不允许'), 405);
    }
    
    // 解析请求体
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return handleError(new Error('无效的请求体格式'), 400);
    }
    
    // 验证必要的字段
    const { email, password } = requestData;
    if (!email || !password) {
      return handleError(new Error('缺少必要的登录信息'), 400);
    }
    
    // 调用Supabase进行登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // 处理登录失败
    if (error) {
      return handleError(new Error(error.message || '登录失败'), 401);
    }
    
    // 返回成功响应，包含用户信息和会话
    const response = successResponse({
      user: data.user,
      session: data.session
    });
    
    // 添加CORS头
    return addCorsHeaders(response);
  } catch (error) {
    console.error('处理登录请求时出错:', error);
    return handleError(error);
  }
}

// 导出请求处理函数
export function onRequest(context) {
  return handleLoginRequest(context.request);
}