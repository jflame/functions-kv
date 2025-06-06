/**
 * API测试脚本
 * 用于测试浏览器AI自动化API的功能
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API基础URL（本地测试时使用）
const BASE_URL = 'http://localhost:8088';

// 测试用户凭据
const TEST_USER = {
  email: 'test001@sikbuk.com',
  password: 'supatest20',
  name: 'Test User'
};

// 存储认证令牌
let authToken = null;

/**
 * 发送HTTP请求的辅助函数
 * @param {string} endpoint - API端点
 * @param {string} method - HTTP方法
 * @param {Object} body - 请求体
 * @param {boolean} useAuth - 是否使用认证令牌
 * @returns {Promise<Object>} 响应数据
 */
async function sendRequest(endpoint, method = 'GET', body = null, useAuth = false) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error(`请求 ${url} 失败:`, error);
    throw error;
  }
}

/**
 * 测试主页API
 */
async function testHomeAPI() {
  console.log('\n===== 测试主页API =====');
  try {
    const response = await sendRequest('/');
    console.log(`状态码: ${response.status}`);
    console.log('API信息:', response.data);
    console.log('✅ 主页API测试通过');
  } catch (error) {
    console.error('❌ 主页API测试失败:', error);
  }
}

/**
 * 测试用户注册API
 */
async function testRegisterAPI() {
  console.log('\n===== 测试用户注册API =====');
  try {
    const response = await sendRequest('/api/auth/register', 'POST', TEST_USER);
    console.log(`状态码: ${response.status}`);
    console.log('响应数据:', response.data);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ 用户注册API测试通过');
    } else {
      console.log('⚠️ 用户可能已存在，继续测试');
    }
  } catch (error) {
    console.error('❌ 用户注册API测试失败:', error);
  }
}

/**
 * 测试用户登录API
 */
async function testLoginAPI() {
  console.log('\n===== 测试用户登录API =====');
  try {
    const response = await sendRequest('/api/auth/login', 'POST', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    console.log(`状态码: ${response.status}`);
    
    if (response.status === 200 && response.data.success) {
      authToken = response.data.data.session.access_token;
      console.log('获取到认证令牌:', authToken.substring(0, 10) + '...');
      console.log('✅ 用户登录API测试通过');
    } else {
      console.log('❌ 用户登录失败:', response.data);
    }
  } catch (error) {
    console.error('❌ 用户登录API测试失败:', error);
  }
}

/**
 * 测试获取当前用户信息API
 */
async function testGetCurrentUserAPI() {
  console.log('\n===== 测试获取当前用户信息API =====');
  
  if (!authToken) {
    console.log('⚠️ 没有认证令牌，跳过测试');
    return;
  }
  
  try {
    const response = await sendRequest('/api/users/me', 'GET', null, true);
    console.log(`状态码: ${response.status}`);
    console.log('用户信息:', response.data);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ 获取当前用户信息API测试通过');
    } else {
      console.log('❌ 获取当前用户信息失败:', response.data);
    }
  } catch (error) {
    console.error('❌ 获取当前用户信息API测试失败:', error);
  }
}

/**
 * 测试浏览器自动化预测API
 */
async function testBrowserAutomationAPI() {
  console.log('\n===== 测试浏览器自动化预测API =====');
  
  try {
    // 读取测试图片（Base64编码）
    // 获取当前目录下的 screen.jpg 文件路径
    const imagePath = path.join(__dirname, 'screen.jpg');
    // 同步读取图片文件
    const imageBuffer = fs.readFileSync(imagePath);
    // 转换为 Base64 字符串
    const base64String = imageBuffer.toString('base64');
    
    // 如果需要 Data URL 格式（可直接用于HTML的src属性）
    const screenshotBase64 = `data:image/jpeg;base64,${base64String}`;
    // 注意：这里使用了一个占位符图片数据，实际测试需要提供真实的截图
    // const screenshotBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    
    const testData = {
      screenshot: screenshotBase64,
      //text: '这是一个测试页面，包含登录按钮和搜索框',
      userRequest: '我想点击个人中心按钮'
    };
    
    const response = await sendRequest('/api/browser-automation/predict', 'POST', testData, true);
    console.log(`状态码: ${response.status}`);
    
    if (response.status === 200 && response.data.success) {
      console.log('预测结果:', response.data.data.prediction);
      //console.log('解析的操作:', response.data.data.actions);
      console.log('✅ 浏览器自动化预测API测试通过');
    } else {
      console.log('❌ 浏览器自动化预测失败:', response.data);
    }
  } catch (error) {
    console.error('❌ 浏览器自动化预测API测试失败:', error);
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始API测试...');
  
  try {
    //await testHomeAPI();
    //await testRegisterAPI();
    //await testLoginAPI();
    //await testGetCurrentUserAPI();
    await testBrowserAutomationAPI();
    
    console.log('\n🎉 所有测试完成!');
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
}

// 执行测试
runAllTests();