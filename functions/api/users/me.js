/**
 * 用户API - 获取当前用户信息
 * 返回当前登录用户的详细信息
 */
import { authenticate, handleError, successResponse, addCorsHeaders, handlePreflight } from '../../utils/middleware.js';
import { supabase } from '../../utils/supabase.js';

/**
 * 处理获取当前用户信息的请求
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handleGetCurrentUserRequest(request) {
  try {
    // 处理OPTIONS请求（预检请求）
    if (request.method === 'OPTIONS') {
      return handlePreflight();
    }
    
    // 只接受GET请求
    if (request.method !== 'GET') {
      return handleError(new Error('方法不允许'), 405);
    }
    
    // 验证用户身份
    const { user, error } = await authenticate(request);
    if (error) {
      return handleError(error, 401);
    }
    
    // 获取用户的详细信息（可以从Supabase的profiles表中获取更多信息）
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116是"没有找到结果"的错误
      console.warn('获取用户资料时出错:', profileError);
    }
    
    // 构建用户信息响应
    const userInfo = {
      id: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
      lastSignIn: user.last_sign_in_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      profile: profile || null
    };
    
    // 返回成功响应
    const response = successResponse({
      user: userInfo
    });
    
    // 添加CORS头
    return addCorsHeaders(response);
  } catch (error) {
    console.error('处理获取当前用户信息请求时出错:', error);
    return handleError(error);
  }
}

// 导出请求处理函数
export function onRequest(context) {
  return handleGetCurrentUserRequest(context.request);
}