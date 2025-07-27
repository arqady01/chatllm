# API Key 隐藏/显示功能

## 功能描述

在设置界面的API配置页面中，为API Key输入字段添加了一个隐藏/显示切换按钮，用户可以通过点击眼睛图标来切换API Key的显示状态。

## 功能特性

- **默认隐藏**: API Key默认以密码形式隐藏显示（显示为点或星号）
- **一键切换**: 点击眼睛图标可以在隐藏和显示之间切换
- **图标反馈**: 
  - 👁️ `eye-outline`: 当前隐藏状态，点击可显示
  - 👁️‍🗨️ `eye-off-outline`: 当前显示状态，点击可隐藏
- **用户友好**: 按钮位置在输入框右侧，方便点击

## 实现细节

### 状态管理
```typescript
const [showApiKey, setShowApiKey] = useState(false);
```

### UI组件结构
```typescript
<View style={styles.apiKeyInputContainer}>
  <TextInput
    style={[styles.input, styles.apiKeyInput]}
    secureTextEntry={!showApiKey}
    // ... 其他属性
  />
  <TouchableOpacity
    style={styles.toggleApiKeyButton}
    onPress={() => setShowApiKey(!showApiKey)}
  >
    <Ionicons 
      name={showApiKey ? "eye-off-outline" : "eye-outline"} 
      size={20} 
      color="#666" 
    />
  </TouchableOpacity>
</View>
```

### 样式设计
- 使用相对定位将按钮放置在输入框内部右侧
- 为输入框添加右侧内边距，避免文字与按钮重叠
- 按钮有适当的点击区域，提升用户体验

## 使用方法

1. 打开应用设置页面
2. 点击"API 配置"进入配置页面
3. 在API Key输入框中输入您的密钥
4. 点击输入框右侧的眼睛图标来切换显示/隐藏状态

## 安全性

- 默认隐藏状态保护用户隐私
- 只在用户主动操作时才显示明文
- 适合在公共场所或他人可能看到屏幕时使用

## 测试

功能已通过单元测试验证：
- 切换逻辑正确性
- 图标状态对应关系
- secureTextEntry属性控制

运行测试：
```bash
npm test
```

## 文件修改

- `src/screens/ApiConfigScreen.tsx`: 主要功能实现
- `__tests__/ApiConfigScreen.test.tsx`: 单元测试
- `docs/api-key-toggle-feature.md`: 功能文档
