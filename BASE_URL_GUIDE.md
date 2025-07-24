# Base URL 配置完全指南

## 🎯 智能检测功能（推荐）

### 最简单的方法
1. 只输入域名部分：`https://api.example.com`
2. 点击"智能检测"按钮
3. 系统自动找到正确的API端点
4. 确认并保存

## 🔒 强制模式（高级功能）

### 什么是强制模式？
当您确切知道完整的API端点时，可以使用强制模式绕过自动检测，直接指定完整的URL。

### 如何使用强制模式？
1. 输入完整的API端点URL
2. 在URL末尾添加 `#` 号标记
3. 点击"智能检测"按钮
4. 系统将直接使用您指定的完整URL

### 强制模式示例
```
输入：https://api.huawen.blog/v1/chat/completions#
结果：直接使用 https://api.huawen.blog/v1/chat/completions
```

### 强制模式的优势
- ✅ 绕过自动检测，直接使用指定URL
- ✅ 适用于非标准端点格式
- ✅ 提供最大的灵活性和控制权
- ✅ 避免自动添加任何端点路径

### 检测原理
系统会依次尝试以下端点格式：
```
https://your-domain.com/v1          ← 最常见
https://your-domain.com             ← 直接访问
https://your-domain.com/api/v1      ← 带api路径
https://your-domain.com/openai/v1   ← 代理服务
https://your-domain.com/v1/openai   ← 另一种代理
```

## 📝 常见服务配置示例

### OpenAI 官方
```
输入：https://api.openai.com
检测结果：https://api.openai.com/v1
```

### Azure OpenAI Service
```
输入：https://your-resource.openai.azure.com
检测结果：https://your-resource.openai.azure.com/openai/deployments/your-deployment
```

### 第三方代理服务
```
输入：https://api.proxy-service.com
可能结果：
- https://api.proxy-service.com/v1
- https://api.proxy-service.com/openai/v1
```

### 自建服务
```
输入：https://your-server.com
可能结果：
- https://your-server.com/v1
- https://your-server.com/api/v1
```

## ⚠️ 常见错误和解决方案

### 错误1：智能模式包含完整路径
❌ **错误**：`https://api.example.com/v1/chat/completions`
✅ **正确**：`https://api.example.com`
🔒 **强制模式**：`https://api.example.com/v1/chat/completions#`

**说明**：智能模式不要包含具体路径，强制模式必须包含完整路径并加#号。

### 错误2：缺少协议
❌ **错误**：`api.example.com`
✅ **正确**：`https://api.example.com`

**说明**：必须包含 `https://` 协议前缀。

### 错误3：多余的斜杠
❌ **错误**：`https://api.example.com///`
✅ **正确**：`https://api.example.com`

**说明**：末尾的斜杠会被自动清理。

### 错误4：端口号处理
✅ **正确**：`https://api.example.com:8080`
✅ **正确**：`https://localhost:3000`

**说明**：端口号会被正确保留。

## 🔧 手动配置（高级用户）

如果智能检测失败，可以手动配置：

### 标准OpenAI格式
```
Base URL: https://api.example.com/v1
API调用: {baseUrl}/chat/completions
完整URL: https://api.example.com/v1/chat/completions
```

### 自定义路径格式
```
Base URL: https://example.com/api/openai/v1
API调用: {baseUrl}/chat/completions
完整URL: https://example.com/api/openai/v1/chat/completions
```

## 🧪 测试和验证

### 检测成功的标志
- ✅ 显示"检测成功"消息
- ✅ Base URL自动更新为正确格式
- ✅ 可以成功获取模型列表
- ✅ 连接测试通过

### 检测失败的原因
- ❌ API Key无效或缺失
- ❌ 网络连接问题
- ❌ 服务不支持OpenAI格式
- ❌ 域名无法访问

### 故障排除步骤
1. **检查API Key**：确保API Key正确且有效
2. **检查网络**：确保能访问目标域名
3. **检查服务**：确认服务支持OpenAI API格式
4. **手动测试**：使用curl等工具手动测试端点

## 📊 支持的服务类型

### ✅ 完全兼容
- OpenAI官方API
- Azure OpenAI Service
- 大部分第三方代理服务
- 自建OpenAI兼容服务

### ⚠️ 部分兼容
- 需要特殊认证的服务
- 非标准端点格式的服务
- 需要额外参数的服务

### ❌ 不兼容
- 非OpenAI格式的API
- 需要特殊协议的服务
- 不支持标准HTTP请求的服务

## 🔍 调试技巧

### 查看检测过程
在开发模式下，可以在控制台看到检测过程：
```
Testing endpoint: https://api.example.com/v1
Testing endpoint: https://api.example.com
Testing endpoint: https://api.example.com/api/v1
...
```

### 手动验证端点
使用curl命令测试：
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.example.com/v1/models
```

### 常见响应格式
成功的models端点应该返回：
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-3.5-turbo",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai"
    }
  ]
}
```

## 💡 最佳实践

1. **优先使用智能检测**：让系统自动找到正确端点
2. **保存成功的配置**：检测成功后立即保存
3. **定期测试连接**：确保配置持续有效
4. **查看示例**：参考应用内的Base URL示例
5. **联系服务商**：如有疑问，咨询API服务提供商

## 🆘 获取帮助

如果仍然无法配置成功：
1. 查看应用内的"Base URL示例"
2. 检查API服务商的文档
3. 确认API Key的权限和有效性
4. 尝试使用其他网络环境

智能检测功能让Base URL配置变得简单，大多数情况下只需要输入域名即可！
