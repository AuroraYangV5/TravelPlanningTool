# 定制旅游助手 (Custom Travel Assistant)

这是一个基于 **豆包 (Doubao) 大模型** 驱动的全栈旅游规划应用。它能够根据用户的目的地、旅行目的、天数和预算，自动生成详细的旅游攻略，并提供实时的 AI 旅游助手服务。

## ✨ 功能特性

- 🗺️ **智能行程生成**：通过分步向导收集需求，生成包含景点、交通、餐饮和预算的详细行程。
- 💬 **AI 旅游助手**：内置实时聊天窗口，随时解答关于景点门票、当地美食或路线微调的问题。
- 📍 **手绘路线图**：可视化展示旅行路线，让行程一目了然。
- 🏨 **精选住宿推荐**：根据预算范围推荐合适的酒店及区域。
- 🍱 **地道美食发现**：为每一天推荐当地特色餐厅和必吃菜品。
- 📱 **全平台适配**：优雅的响应式设计，支持桌面端和移动端流畅使用。

## 🚀 技术栈

- **前端**: React, Vite, Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **后端**: Node.js, Express
- **AI SDK**: OpenAI SDK (配置为火山引擎 Ark 接口)
- **大模型**: 豆包 (Doubao) - 火山引擎 Ark 平台

## 🛠️ 快速开始

### 1. 环境配置

在根目录下创建 `.env` 文件（或在 AI Studio 的 Secrets 面板中设置）：

```env
DOUBAO_API_KEY=你的火山引擎API密钥
DOUBAO_MODEL_ID=你的推理终端ID (Endpoint ID)
```

> **注意**：本项目默认使用豆包 **Coding Plan (编程计划)** 套餐，接口地址已配置为 `https://ark.cn-beijing.volces.com/api/coding/v3`。

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将运行在 `http://localhost:3000`。

## 📂 项目结构

- `/src`: 前端 React 源代码
  - `App.tsx`: 主应用逻辑与 UI
  - `index.css`: 全局样式与 Tailwind 配置
- `server.ts`: 后端 Express 服务器，处理 AI 请求代理
- `package.json`: 项目依赖与脚本配置

## 📝 许可证

本项目采用 [Apache-2.0](LICENSE) 许可证。

---

*由 豆包大模型 提供强力支持*
