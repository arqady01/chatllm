# MelonWise iOS - AI聊天应用

一个基于React Native Expo和TypeScript开发的iOS AI聊天应用，支持与OpenAI兼容的大模型进行对话。

## 功能特性

- 🤖 支持与OpenAI兼容的大模型对话
- 🔧 自定义API Key和Base URL配置
- 🎯 **自动获取可用模型列表**
- 🔍 **智能Base URL检测和修正**
- 🔒 **强制模式支持（#号标记）**
- 📱 **模块化设置界面设计**
- 💾 本地存储聊天记录和配置
- 📱 原生iOS界面设计
- 🔄 实时消息同步
- ⚡ 快速响应和流畅体验
- 🛡️ 错误处理和异常恢复

## 技术栈

- **React Native Expo** - 跨平台移动应用开发框架
- **TypeScript** - 类型安全的JavaScript
- **React Navigation** - 导航管理
- **AsyncStorage** - 本地数据存储
- **Context API** - 状态管理

## 安装和运行

### 前置要求

- Node.js (版本 16 或更高)
- npm 或 yarn
- Expo CLI
- iOS模拟器或真机

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd MelonWise_ios
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 在iOS设备上运行
```bash
npm run ios
```

## 使用说明

### 首次配置

1. 打开应用后，点击底部的"设置"标签
2. 在设置主页面，点击"API配置"进入配置页面
3. 填写以下配置信息：
   - **API Key**: 您的OpenAI API密钥
   - **Base URL**: API服务地址（默认：https://api.openai.com/v1）
   - **模型**: 使用的模型名称（可手动输入或自动获取）

4. **智能Base URL检测**（推荐）：
   - **智能模式**：输入域名部分（如：https://api.example.com），系统自动检测
   - **强制模式**：输入完整URL+#号（如：https://api.example.com/v1/chat/completions#），强制使用指定URL
   - 点击"智能检测"按钮自动找到正确的API端点

5. **自动获取模型**（推荐）：
   - Base URL配置正确后，点击"获取模型"按钮
   - 自动获取可用模型列表
   - 从弹出的模型列表中选择合适的模型

6. 点击"测试连接"验证配置是否正确
7. 点击"保存设置"保存配置并返回主页面

### 开始聊天

1. 配置完成后，切换到"聊天"标签
2. 在输入框中输入您的问题
3. 点击发送按钮或按回车键发送消息
4. AI将会回复您的问题

### 数据管理

- 聊天记录会自动保存到本地
- 在设置主页面点击"数据管理"进入数据管理页面
- 可以查看数据统计、清除聊天记录等
- 配置信息会持久化保存

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ErrorBoundary.tsx
│   ├── LoadingScreen.tsx
│   └── MessageBubble.tsx
├── contexts/           # React Context
│   └── AppContext.tsx
├── navigation/         # 导航配置
│   └── AppNavigator.tsx
├── screens/           # 页面组件
│   ├── ChatScreen.tsx
│   └── SettingsScreen.tsx
├── services/          # 服务层
│   ├── openai.ts
│   └── storage.ts
└── types/            # TypeScript类型定义
    └── index.ts
```

## API配置说明

### OpenAI官方API
- Base URL: `https://api.openai.com/v1`
- 需要有效的OpenAI API Key

### 其他兼容服务
应用支持任何OpenAI兼容的API服务，只需要：
1. 提供正确的Base URL
2. 使用相应的API Key
3. 确保API格式兼容OpenAI标准

## 开发说明

### 添加新功能

1. 在相应的目录下创建新文件
2. 更新类型定义（如需要）
3. 在Context中添加相关状态和方法
4. 更新UI组件

### 调试

- 使用Expo开发工具进行调试
- 查看控制台输出获取错误信息
- 使用React DevTools检查组件状态

## 常见问题

### Q: API连接失败怎么办？
A: 请检查：
- API Key是否正确
- Base URL是否可访问
- 网络连接是否正常
- API服务是否正常运行

### Q: 消息发送失败？
A: 可能的原因：
- API配置错误
- 网络连接问题
- API服务限制或配额不足

### Q: 如何清除所有数据？
A: 在设置页面点击"清除聊天记录"，或者卸载重装应用。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。
