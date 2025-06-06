/**
 * 浏览器自动化API - 预测用户操作
 * 接收浏览器截图、文本和用户需求，返回预测的操作
 */
import { predictAction, parseActionPrediction } from '../../utils/ai-service.js';
import { authenticate, handleError, successResponse, addCorsHeaders, handlePreflight } from '../../utils/middleware.js';

/**
 * 处理预测请求
 * @param {Request} request - 请求对象
 * @param {Object} context - 上下文对象
 * @returns {Promise<Response>} 响应对象
 */
async function handlePredictRequest(request, context) {
  try {
    // 处理OPTIONS请求（预检请求）
    if (request.method === 'OPTIONS') {
      return handlePreflight();
    }
    
    // 只接受POST请求
    if (request.method !== 'POST') {
      return handleError(new Error('方法不允许'), 405);
    }
    
    // 验证用户身份（可选，取决于是否需要认证）
    // const { user, error } = await authenticate(request);
    // if (error) {
    //   return handleError(error, 401);
    // }
    
    // 解析请求体
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      return handleError(new Error('无效的请求体格式'), 400);
    }
    
    // 验证必要的字段
    const { screenshot, text, userRequest } = requestData;
    if (!screenshot) {
      return handleError(new Error('缺少必要的截图数据'), 400);
    }
    if (!userRequest) {
      return handleError(new Error('缺少用户需求描述'), 400);
    }
    
    // 调用AI服务进行预测
    const predictionResult = await predictAction({
      screenshot,
      text: text || '',
      userRequest
    });
    
    // 处理预测失败
    if (!predictionResult.success) {
      return handleError(new Error(predictionResult.error || '预测失败'), 500);
    }
    
    // 解析预测结果
    //const actions = parseActionPrediction(predictionResult.prediction);
    
    // 返回成功响应
    const response = successResponse({
      raw: predictionResult.raw,
      prediction: predictionResult.prediction,
    });
    
    // 添加CORS头
    return addCorsHeaders(response);
  } catch (error) {
    console.error('处理预测请求时出错:', error);
    return handleError(error);
  }
}

// 导出请求处理函数
export function onRequest(context) {
  return handlePredictRequest(context.request, context);
}