# 聊天设置功能

## 🎯 功能概述

在对话界面的右上角添加了设置按钮，提供以下功能：
1. **修改聊天组名称** - 可以随时更改当前对话组的名称
2. **设置上下文条数** - 控制AI记忆的历史消息数量

## 🔧 功能详情

### 1. 修改聊天组名称
- 点击设置按钮 → 修改"聊天组名称"字段
- 支持最多50个字符
- 修改后会立即更新界面标题和聊天组列表

### 2. 上下文条数设置

#### 选项说明：
- **不限制上下文**：AI会记住所有历史对话
- **限制条数**：设置具体的上下文消息数量（最少1条）

#### 使用场景：
- **设置为1**：每次对话都是独立的，适合单次问答
- **设置为3-10**：记住最近几轮对话，平衡记忆和性能
- **不限制**：完整的对话记忆，适合长期对话

## 🏗️ 技术实现

### 数据结构
```typescript
interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
  lastMessageTime?: number;
  contextLimit?: number; // 新增：上下文条数限制
}
```

### 上下文限制逻辑
```typescript
// 在发送消息时应用上下文限制
const currentGroup = state.chatGroups.find(g => g.id === groupId);
const contextLimit = currentGroup?.contextLimit;

if (contextLimit !== undefined && currentContextMessages.length > contextLimit) {
  currentContextMessages = currentContextMessages.slice(-contextLimit);
}
```

## 📱 用户界面

### 设置按钮位置
- 位于对话界面右上角
- 使用齿轮图标（settings-outline）
- 点击后弹出设置模态框

### 设置模态框
- **头部**：取消/保存按钮
- **聊天组名称**：文本输入框
- **上下文设置**：开关 + 数字输入
- **示例说明**：帮助用户理解不同设置的效果

## 🔄 状态管理

### 新增Actions
```typescript
| { type: 'UPDATE_CHAT_GROUP'; payload: ChatGroup }
```

### 新增函数
```typescript
updateChatGroup: (group: ChatGroup) => Promise<void>
```

### 数据持久化
- 聊天组设置自动保存到本地存储
- 上下文限制立即生效，无需重启应用

## 🎨 UI组件

### ChatSettingsModal
- 响应式设计，支持不同屏幕尺寸
- 表单验证，防止无效输入
- 加载状态，提供良好的用户反馈

### 样式特点
- 遵循iOS设计规范
- 清晰的视觉层次
- 友好的交互反馈

## 🚀 使用流程

1. **进入对话界面**
2. **点击右上角设置按钮**
3. **修改聊天组名称**（可选）
4. **设置上下文条数**：
   - 开启"不限制上下文"开关，或
   - 关闭开关并输入具体数字（1-999）
5. **点击保存**
6. **设置立即生效**

## 📊 示例场景

### 场景1：独立问答
- 设置上下文条数为 **1**
- 每次提问都是全新的对话
- 适合：翻译、计算、单次查询

### 场景2：短期对话
- 设置上下文条数为 **3-5**
- 记住最近几轮对话
- 适合：简短的讨论、问题澄清

### 场景3：长期对话
- 选择 **不限制上下文**
- 记住完整的对话历史
- 适合：深度讨论、学习辅导、创作协作

## ⚡ 性能优化

### 上下文管理
- 使用独立的上下文数组
- 避免频繁的数组过滤操作
- 智能的上下文截取算法

### 内存管理
- 上下文限制有效控制内存使用
- 自动清理超出限制的历史消息
- 保持应用响应速度

## 🔮 未来扩展

1. **智能上下文选择**
   - 基于消息重要性自动选择上下文
   - 保留关键信息，过滤无关内容

2. **上下文模板**
   - 预设不同场景的上下文配置
   - 快速切换对话模式

3. **上下文统计**
   - 显示当前上下文使用情况
   - 提供优化建议
