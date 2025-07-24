# MelonWise AI 使用指南

## 快速开始

### 1. 启动应用
```bash
npm start
```

### 2. 在iOS设备上运行
- 使用iOS模拟器：按 `i` 键
- 使用真机：用相机扫描二维码

### 3. 配置API
1. 打开应用后，点击底部的"设置"标签
2. 填写API配置：
   - **API Key**: 您的OpenAI API密钥
   - **Base URL**: `https://api.openai.com/v1` (或其他兼容服务)
   - **模型**: 可手动输入或使用"获取模型"功能
3. **智能Base URL检测**：
   - 只需输入域名（如：https://api.example.com）
   - 点击"智能检测"自动找到正确端点
   - 查看"Base URL示例"了解更多格式
4. **自动获取模型**：
   - Base URL配置正确后点击"获取模型"
   - 从弹出列表中选择合适的模型
5. 点击"测试连接"验证配置
6. 点击"保存设置"

### 4. 开始聊天
1. 切换到"聊天"标签
2. 在输入框输入消息
3. 点击发送按钮

## 支持的API服务

### OpenAI官方
- Base URL: `https://api.openai.com/v1`
- 支持模型: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo` 等

### 其他兼容服务
任何支持OpenAI API格式的服务都可以使用，例如：
- Azure OpenAI Service
- 本地部署的兼容服务
- 第三方API代理服务

## 功能说明

### 聊天功能
- ✅ 发送文本消息
- ✅ 接收AI回复
- ✅ 消息历史记录
- ✅ 实时状态显示

### 设置功能
- ✅ API配置管理
- ✅ **智能Base URL检测**
- ✅ **自动获取模型列表**
- ✅ 连接测试
- ✅ 数据清除

### 数据存储
- ✅ 自动保存聊天记录
- ✅ 持久化配置信息
- ✅ 本地数据管理

## 故障排除

### 常见问题

**Q: 应用无法启动？**
A: 确保已安装所有依赖：`npm install`

**Q: API连接失败？**
A: 检查：
- API Key是否正确
- Base URL是否可访问
- 网络连接是否正常

**Q: 消息发送失败？**
A: 可能原因：
- API配置错误
- 网络问题
- API服务限制

**Q: 如何重置应用？**
A: 在设置页面点击"清除聊天记录"

### 开发调试

1. 查看Metro bundler输出
2. 使用Expo开发工具
3. 检查设备/模拟器日志
4. 使用React DevTools

## 开发命令

```bash
# 启动开发服务器
npm start

# 在iOS模拟器中运行
npm run ios

# 在Android模拟器中运行  
npm run android

# 在Web浏览器中运行
npm run web
```

## 项目结构

```
MelonWise_ios/
├── App.tsx                 # 应用入口
├── src/
│   ├── components/         # 可复用组件
│   ├── contexts/          # React Context
│   ├── navigation/        # 导航配置
│   ├── screens/          # 页面组件
│   ├── services/         # 服务层
│   └── types/           # 类型定义
├── assets/              # 静态资源
└── package.json        # 项目配置
```
