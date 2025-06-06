# 浏览器AI自动化后端

这是一个部署在腾讯EdgeOne Pages平台的serverless后端项目，通过Supabase实现用户系统，提供浏览器AI自动化功能。该项目可以接收浏览器截图、文本和用户需求，通过调用大模型API预测用户操作，并返回结构化的操作指令。

## 功能特点

- 基于腾讯EdgeOne Pages平台的Serverless架构
- 使用Supabase实现用户认证和授权
- 提供浏览器自动化AI预测API
- 支持跨域请求(CORS)
- 标准化的错误处理和响应格式

## 项目结构

```
/
├── .edgeone/            # EdgeOne配置文件
├── functions/           # EdgeOne Pages函数目录
│   ├── index.js         # 主页API
│   ├── api/             # API端点
│   │   ├── auth/        # 认证相关API
│   │   │   ├── login.js     # 用户登录
│   │   │   └── register.js  # 用户注册
│   │   ├── users/       # 用户相关API
│   │   │   └── me.js        # 获取当前用户信息
│   │   └── browser-automation/  # 浏览器自动化API
│   │       └── predict.js       # 预测用户操作
│   └── utils/           # 工具类
│       ├── ai-service.js    # AI服务
│       ├── middleware.js    # 中间件
│       └── supabase.js      # Supabase客户端
├── test/                # 测试目录
│   └── test.js          # API测试脚本
├── .env.example         # 环境变量示例
├── package.json         # 项目依赖
└── README.md            # 项目说明
```

## API路由

根据EdgeOne Pages的路由规则，以下是项目的API路由：

- `/` - 主页，提供API信息
- `/api/auth/login` - 用户登录
- `/api/auth/register` - 用户注册
- `/api/users/me` - 获取当前用户信息
- `/api/browser-automation/predict` - 预测用户操作

## 安装和部署

### 前提条件

- 注册[腾讯EdgeOne](https://www.tencentcloud.com/products/edgeone)账号
- 创建[Supabase](https://supabase.com/)项目
- 获取大模型API访问凭证

### 安装步骤

1. 克隆项目

```bash
git clone <repository-url>
cd edgeone_pages
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制`.env.example`文件为`.env`，并填写相应的配置：

```bash
cp .env.example .env
# 编辑.env文件，填写Supabase和AI API的配置
```

4. 部署到EdgeOne Pages

```bash
# 使用EdgeOne CLI部署
edgeone deploy
```

## 使用示例

### 预测用户操作

```javascript
// 发送POST请求到/api/browser-automation/predict
const response = await fetch('https://your-domain.com/api/browser-automation/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN' // 可选，取决于是否启用认证
  },
  body: JSON.stringify({
    screenshot: 'data:image/png;base64,...', // Base64编码的截图
    userRequest: '我想点击登录按钮'
  })
});

const result = await response.json();
console.log(result.data.actions); // 结构化的操作指令
```

## 测试

运行测试脚本：

```bash
npm test
```