/**
 * 用户认证API - 注册
 * 处理用户注册请求，创建新用户
 */
import { supabase } from '../../utils/supabase.js';
import { handleError, successResponse, addCorsHeaders, handlePreflight } from '../../utils/middleware.js';

/**
 * 处理注册请求
 * @param {Request} request - 请求对象
 * @returns {Promise<Response>} 响应对象
 */
async function handleRegisterRequest(request) {
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
    const { email, password, name } = requestData;
    if (!email || !password) {
      return handleError(new Error('缺少必要的注册信息'), 400);
    }
    
    // 调用Supabase进行注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || email.split('@')[0],
        }
      }
    });
    
    // 处理注册失败
    if (error) {
      return handleError(new Error(error.message || '注册失败'), 400);
    }
    
    // 返回成功响应
    const response = successResponse({
      user: data.user,
      message: '注册成功，请验证您的邮箱'
    });
    
    // 添加CORS头
    return addCorsHeaders(response);
  } catch (error) {
    console.error('处理注册请求时出错:', error);
    return handleError(error);
  }
}

// 导出请求处理函数
export function onRequest(context) {
  return handleRegisterRequest(context.request);
}