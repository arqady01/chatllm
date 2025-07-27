import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatGroup } from '../types';

interface ChatSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  chatGroup: ChatGroup;
  onUpdateGroup: (updatedGroup: ChatGroup) => Promise<void>;
}

export const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  visible,
  onClose,
  chatGroup,
  onUpdateGroup,
}) => {
  const [groupName, setGroupName] = useState(chatGroup.name);
  const [contextInput, setContextInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setGroupName(chatGroup.name);
      // 将上下文限制转换为输入字符串
      if (chatGroup.contextLimit === undefined) {
        setContextInput('-1');  // -1代表无限制
      } else {
        setContextInput(chatGroup.contextLimit.toString());
      }
    }
  }, [visible, chatGroup]);

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('错误', '对话组名称不能为空');
      return;
    }

    // 解析上下文输入 - 严格的整数验证
    let contextLimit: number | undefined;
    const trimmedInput = contextInput.trim();

    if (trimmedInput === '') {
      Alert.alert('错误', '请输入上下文条数');
      return;
    }

    // 检查是否为纯数字（包括负号）
    if (!/^-?\d+$/.test(trimmedInput)) {
      Alert.alert('错误', '只能输入整数，-1表示无限制，0或正整数表示具体条数');
      return;
    }

    const num = parseInt(trimmedInput);

    if (num === -1) {
      // -1代表无限制
      contextLimit = undefined;
    } else if (num >= 0) {
      // 0或正整数
      contextLimit = num;
    } else {
      // 其他负数不允许
      Alert.alert('错误', '不支持除-1以外的负数，-1表示无限制');
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup: ChatGroup = {
        ...chatGroup,
        name: groupName.trim(),
        contextLimit,
        updatedAt: Date.now(),
      };

      await onUpdateGroup(updatedGroup);
      onClose();
    } catch (error) {
      console.error('Failed to update chat group:', error);
      Alert.alert('错误', '更新对话组失败');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.title}>聊天设置</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={[styles.saveText, isLoading && styles.saveTextDisabled]}>
              {isLoading ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 对话组名称 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>对话组名称</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="请输入对话组名称"
              maxLength={50}
              editable={!isLoading}
            />
          </View>

          {/* 上下文设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>上下文设置</Text>
            <Text style={styles.sectionDescription}>
              控制AI在对话中能记住多少条历史消息。输入0或正整数表示具体条数，输入-1表示无限制。
            </Text>

            {/* 上下文输入框 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>上下文条数</Text>
              <TextInput
                style={styles.contextInput}
                value={contextInput}
                onChangeText={setContextInput}
                placeholder="输入整数（-1表示无限制）"
                editable={!isLoading}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  inputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  contextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
});
