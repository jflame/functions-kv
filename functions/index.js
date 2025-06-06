/**
 * 主页API - 项目入口点
 * 提供项目的基本信息和API文档
 */

/**
 * 处理主页请求
 * @param {Request} request - 请求对象
 * @returns {Response} 响应对象
 */
function handleHomeRequest(request) {
  const apiInfo = {
    name: "浏览器AI自动化API",
    version: "1.0.0",
    description: "基于AI的浏览器自动化服务，可以根据截图和文本预测用户操作",
    endpoints: [
      {
        path: "/api/browser-automation/predict",
        method: "POST",
        description: "根据浏览器截图和文本预测用户操作",
        requiresAuth: false
      },
      {
        path: "/api/auth/login",
        method: "POST",
        description: "用户登录",
        requiresAuth: false
      },
      {
        path: "/api/auth/register",
        method: "POST",
        description: "用户注册",
        requiresAuth: false
      },
      {
        path: "/api/users/me",
        method: "GET",
        description: "获取当前用户信息",
        requiresAuth: true
      }
    ],
    documentation: "https://example.com/docs" // 替换为实际的文档URL
  };

  return new Response(JSON.stringify(apiInfo, null, 2), {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// 导出请求处理函数
export function onRequest(context) {
  return handleHomeRequest(context.request);
}