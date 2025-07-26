# 上下文管理系统

## 🎯 概述

新的上下文管理系统使用独立的数组来管理对话上下文，提供更清晰、更可控的上下文管理体验。

## 🏗️ 架构设计

### 核心概念

1. **分离存储和上下文**
   - `messages`: 存储所有消息（用于显示）
   - `contextMessages`: 单独的上下文消息数组（用于API调用）

2. **上下文分隔符**
   - 使用 `isContextSeparator` 标记分隔符消息
   - 分隔符之后的消息会重新开始上下文

3. **智能上下文重建**
   - 应用启动时自动重建上下文
   - 基于最后一个分隔符位置

## 📊 状态管理

### AppState 结构
```typescript
interface AppState {
  messages: Message[];          // 所有消息（显示用）
  contextMessages: Message[];   // 上下文消息（API用）
  // ... 其他字段
}
```

### Actions
- `SET_CONTEXT_MESSAGES`: 设置整个上下文数组
- `ADD_TO_CONTEXT`: 添加消息到上下文
- `CLEAR_CONTEXT`: 清空上下文数组

## 🔧 核心功能

### 1. 发送消息
```typescript
// 用户消息自动添加到上下文
dispatch({ type: 'ADD_TO_CONTEXT', payload: userMessage });

// 助手回复也添加到上下文
dispatch({ type: 'ADD_TO_CONTEXT', payload: assistantMessage });
```

### 2. 清除上下文
```typescript
// 清空上下文数组，添加分隔符到显示消息
clearContext();
```

### 3. 上下文重建
```typescript
// 应用启动时自动重建
const contextMessages = ContextManager.rebuildContext(savedMessages);
```

## 🛠️ 工具类：ContextManager

### 主要方法

1. **rebuildContext(messages)**
   - 从消息数组重建上下文
   - 找到最后一个分隔符后的消息

2. **isValidForContext(message)**
   - 验证消息是否适合加入上下文
   - 过滤空消息和分隔符

3. **buildApiMessages(contextMessages)**
   - 构建发送给API的消息格式
   - 处理文本和图片消息

4. **getContextStats(contextMessages, allMessages)**
   - 获取详细的上下文统计信息

## 📱 UI 组件

### ContextInfo 组件
- 显示当前上下文状态
- 提供快速清除上下文按钮
- 显示上下文/总消息比例

## ✅ 优势

1. **清晰的状态管理**
   - 上下文状态独立管理
   - 不再依赖 `excludeFromContext` 标记

2. **更好的性能**
   - 避免频繁的数组过滤操作
   - 直接使用上下文数组

3. **易于调试**
   - 上下文状态一目了然
   - 提供详细的统计信息

4. **灵活的控制**
   - 可以精确控制哪些消息参与上下文
   - 支持复杂的上下文管理策略

## 🔄 迁移说明

### 从旧系统迁移
1. 移除 `excludeFromContext` 字段的依赖
2. 使用新的 action 类型管理上下文
3. 更新相关组件以使用新的上下文信息

### 兼容性
- 现有的消息数据结构保持兼容
- 自动处理旧的 `excludeFromContext` 标记（忽略）

## 🚀 未来扩展

1. **上下文压缩**
   - 自动压缩长上下文
   - 保留重要消息

2. **智能上下文选择**
   - 基于相关性选择上下文消息
   - 动态调整上下文长度

3. **上下文模板**
   - 预定义的上下文模板
   - 快速切换不同的对话模式
