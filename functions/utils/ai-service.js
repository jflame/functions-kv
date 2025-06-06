/**
 * AI服务工具类 - 处理与大模型API的交互
 */

/**
 * 调用大模型API进行预测
 * @param {Object} data - 包含浏览器截图、文本和用户需求的数据
 * @returns {Promise<Object>} 预测结果
 */
export async function predictAction(data) {
  const { screenshot, text, userRequest } = data;
  
  try {
    // 构建请求体
    const requestBody = {
      model: "Qwen/Qwen2.5-VL-32B-Instruct", // 使用支持视觉的模型
      messages: [
        {
          role: "system",
          content: `你是一个专业的手机端浏览器自动化助手，能够根据截图和文本内容，预测用户需要在浏览器中执行的操作
          Use a touchscreen to interact with a mobile device, You can perform actions like clicking, typing, swiping, etc
          Sometimes may take time to start or process actions, so you may need to wait to see the results of your actions.
          Make sure to click any buttons, links, icons, etc with the cursor tip in the center of the element. Don't click boxes on their edges unless asked.
          The action to perform. The available actions are:
            * "click": Click the point on the screen with coordinate (x, y).
            * "long_press": Press the point on the screen with coordinate (x, y) for specified seconds.
            * "swipe": Swipe from the starting point with coordinate (x, y) to the end point with coordinates2 (x2, y2).
            * "type": Input the specified text into the activated input box.
            * "wait": Wait specified seconds for the change to happen.
            * "terminate": Terminate the current task and report its completion status.
            
          "coordinate": {
                "description": "(x, y): The x (pixels from the left edge) and y (pixels from the top edge) coordinates to move the mouse to. Required only by <action=click>, <action=long_press>, and <action=swipe>.",
                "type": "array",
            },
            "coordinate2": {
                "description": "(x, y): The x (pixels from the left edge) and y (pixels from the top edge) coordinates to move the mouse to. Required only by <action=swipe>.",
                "type": "array",
            },
            "text": {
                "description": "Required only by <action=key>, <action=type>",
                "type": "string",
            },
            "time": {
                "description": "The seconds to wait. Required only by <action=long_press> and <action=wait>.",
                "type": "number",
            },
            "status": {
                "description": "The status of the task. Required only by <action=terminate>.",
                "type": "string",
                "enum": ["success", "failure"],
            },

            For each call, return a json object with action name and arguments:
            {"action": <action-name>, <arguments-name>: <arguments-value>}
          `
        },
        {
          role: "user",
          content: [
            { type: "text", text: `用户需求: ${userRequest}\n` },
            {
              type: "image_url",
              image_url: { url: screenshot }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.2,
      frequency_penalty: 0.1,
      stream: false,
    };

    // 发送请求到大模型API
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-awwdmffgdmqeltdlhskpffsvfhjxycjftgjoehqpkunbeomy'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      prediction: result.choices[0].message.content,
      raw: result
    };
  } catch (error) {
    console.error('AI预测失败:', error);
    return {
      success: false,
      error: error.message,
      prediction: null
    };
  }
}

/**
 * 解析AI预测结果，转换为结构化的操作指令
 * @param {string} prediction - AI预测的文本结果
 * @returns {Object} 结构化的操作指令
 */
export function parseActionPrediction(prediction) {
  try {
    // 尝试将预测结果解析为JSON
    if (prediction.includes('{') && prediction.includes('}')) {
      // 提取JSON部分
      const jsonMatch = prediction.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
    
    // 如果不是JSON格式，进行简单的文本解析
    // 这里可以根据实际AI输出格式进行更复杂的解析
    const actions = [];
    
    // 分析文本中的操作指令
    if (prediction.includes('点击')) {
      actions.push({ type: 'click', target: extractTarget(prediction, '点击') });
    }
    
    if (prediction.includes('输入')) {
      const target = extractTarget(prediction, '输入');
      const value = extractValue(prediction, '输入');
      actions.push({ type: 'input', target, value });
    }
    
    if (prediction.includes('滚动')) {
      const direction = prediction.includes('向下') ? 'down' : 
                       prediction.includes('向上') ? 'up' : 'down';
      actions.push({ type: 'scroll', direction });
    }
    
    return { actions };
  } catch (error) {
    console.error('解析预测结果失败:', error);
    return { 
      actions: [],
      error: '无法解析预测结果',
      rawPrediction: prediction
    };
  }
}

/**
 * 从文本中提取操作目标
 * @private
 */
function extractTarget(text, actionType) {
  const regex = new RegExp(`${actionType}[^\\n.。,，;；]*?["']+([^"']+)["']`);
  const match = text.match(regex);
  if (match) return match[1];
  
  // 备用提取方法
  const parts = text.split(actionType);
  if (parts.length > 1) {
    const targetPart = parts[1].trim().split(/[\n.。,，;；]/);
    return targetPart[0].trim();
  }
  
  return '';
}

/**
 * 从文本中提取输入值
 * @private
 */
function extractValue(text, actionType) {
  const regex = new RegExp(`${actionType}[^\\n.。,，;；]*?["']+([^"']+)["']`);
  const match = text.match(regex);
  if (match) return match[1];
  
  // 备用提取方法
  if (text.includes('内容为') || text.includes('值为')) {
    const parts = text.includes('内容为') ? 
      text.split('内容为') : text.split('值为');
    if (parts.length > 1) {
      const valuePart = parts[1].trim().split(/[\n.。,，;；]/);
      return valuePart[0].trim().replace(/["']/g, '');
    }
  }
  
  return '';
}