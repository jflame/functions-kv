import { createClient } from '@supabase/supabase-js';

// Supabase配置
const supabaseUrl = 'https://nemxnhrlmfxjteirhdxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lbXhuaHJsbWZ4anRlaXJoZHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1ODM0NTUsImV4cCI6MjA2NDE1OTQ1NX0.8ploe1DZ8GdEQc9CppMcbB3iZXhoYn1_b1AvU-7Hcds';

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 验证用户JWT令牌
 * @param {string} token - 用户的JWT令牌
 * @returns {Promise<{user: Object|null, error: Error|null}>} 用户信息或错误
 */
export async function verifyToken(token) {
  if (!token) {
    return { user: null, error: new Error('未提供认证令牌') };
  }

  try {
    // 使用Supabase验证令牌
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('令牌验证失败:', error.message);
    return { user: null, error };
  }
}

/**
 * 检查用户是否有权限访问特定资源
 * @param {Object} user - 用户对象
 * @param {string} resource - 资源标识符
 * @returns {Promise<boolean>} 是否有权限
 */
export async function checkPermission(user, resource) {
  if (!user || !user.id) return false;
  
  try {
    // 从数据库中查询用户权限
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('resource', resource);
    
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error('权限检查失败:', error.message);
    return false;
  }
}