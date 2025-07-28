import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ChatGroup } from '../types';
import ChatSettingsScreen from './ChatSettingsScreen';

// 模拟的聊天组数据
const mockChatGroups: ChatGroup[] = [
  {
    id: 'test-1',
    name: '测试组1',
    contextLimit: 10, // 10条
    temperature: 0.6,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'test-2',
    name: '测试组2',
    contextLimit: undefined, // 无限制
    temperature: 0.8,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'test-3',
    name: '测试组3',
    contextLimit: 0, // 不记住历史
    temperature: 0.3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'test-4',
    name: '测试组4',
    contextLimit: 17, // 17条
    temperature: 0.7,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'test-5',
    name: '测试组5',
    contextLimit: 34, // 34条
    temperature: 0.5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const TestChatSettingsApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'settings'>('list');
  const [selectedChatGroup, setSelectedChatGroup] = useState<ChatGroup | null>(null);

  const openSettings = (chatGroup: ChatGroup) => {
    console.log('🔧 打开设置页面，chatGroup:', chatGroup);
    setSelectedChatGroup(chatGroup);
    setCurrentView('settings');
  };

  const goBack = () => {
    setCurrentView('list');
    setSelectedChatGroup(null);
  };

  const mockNavigation = {
    goBack,
  };

  if (currentView === 'settings' && selectedChatGroup) {
    return (
      <ChatSettingsScreen
        route={{
          params: {
            chatGroup: selectedChatGroup,
          },
        }}
        navigation={mockNavigation}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>滑块测试应用</Text>
        <Text style={styles.subtitle}>选择一个测试用例来验证滑块行为</Text>

        {mockChatGroups.map((chatGroup) => (
          <TouchableOpacity
            key={chatGroup.id}
            style={styles.testCase}
            onPress={() => openSettings(chatGroup)}
          >
            <View style={styles.testCaseHeader}>
              <Text style={styles.testCaseName}>{chatGroup.name}</Text>
            </View>
            <View style={styles.testCaseDetails}>
              <Text style={styles.testCaseDetail}>
                上下文: {chatGroup.contextLimit === undefined ? '无限制' : 
                        chatGroup.contextLimit === 0 ? '不记住历史' : 
                        `${chatGroup.contextLimit} 条`}
              </Text>
              <Text style={styles.testCaseDetail}>
                温度: {chatGroup.temperature}
              </Text>
            </View>
            <View style={styles.expectedResults}>
              <Text style={styles.expectedTitle}>预期滑块位置:</Text>
              <Text style={styles.expectedDetail}>
                上下文滑块: {chatGroup.contextLimit === undefined ? '最右侧(100%)' : 
                           chatGroup.contextLimit === 0 ? '最左侧(0%)' : 
                           `${Math.round((chatGroup.contextLimit / 51) * 100)}%`}
              </Text>
              <Text style={styles.expectedDetail}>
                温度滑块: {Math.round(chatGroup.temperature * 100)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>测试说明:</Text>
          <Text style={styles.instructionsText}>
            1. 点击任意测试用例打开设置页面
          </Text>
          <Text style={styles.instructionsText}>
            2. 检查滑块位置是否与预期位置匹配
          </Text>
          <Text style={styles.instructionsText}>
            3. 检查显示值是否正确
          </Text>
          <Text style={styles.instructionsText}>
            4. 拖动滑块测试是否流畅
          </Text>
          <Text style={styles.instructionsText}>
            5. 保存后重新打开验证持久性
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  testCase: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testCaseHeader: {
    marginBottom: 10,
  },
  testCaseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  testCaseDetails: {
    marginBottom: 10,
  },
  testCaseDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  expectedResults: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  expectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  expectedDetail: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default TestChatSettingsApp;
