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
  Switch,
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
  const [contextLimit, setContextLimit] = useState<number | undefined>(chatGroup.contextLimit);
  const [isUnlimited, setIsUnlimited] = useState(chatGroup.contextLimit === undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setGroupName(chatGroup.name);
      setContextLimit(chatGroup.contextLimit);
      setIsUnlimited(chatGroup.contextLimit === undefined);
    }
  }, [visible, chatGroup]);

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('错误', '聊天组名称不能为空');
      return;
    }

    if (!isUnlimited && (contextLimit === undefined || contextLimit < 1)) {
      Alert.alert('错误', '上下文条数必须大于等于1');
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup: ChatGroup = {
        ...chatGroup,
        name: groupName.trim(),
        contextLimit: isUnlimited ? undefined : contextLimit,
        updatedAt: Date.now(),
      };

      await onUpdateGroup(updatedGroup);
      onClose();
    } catch (error) {
      console.error('Failed to update chat group:', error);
      Alert.alert('错误', '更新聊天组失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextLimitChange = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) {
      setContextLimit(1);
    } else {
      setContextLimit(num);
    }
  };

  const toggleUnlimited = (value: boolean) => {
    setIsUnlimited(value);
    if (value) {
      setContextLimit(undefined);
    } else {
      setContextLimit(contextLimit || 10);
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
          {/* 聊天组名称 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>聊天组名称</Text>
            <TextInput
              style={styles.textInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="请输入聊天组名称"
              maxLength={50}
              editable={!isLoading}
            />
          </View>

          {/* 上下文设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>上下文设置</Text>
            <Text style={styles.sectionDescription}>
              控制AI在对话中能记住多少条历史消息。设置为1表示每次对话都是独立的，不限制表示记住所有历史消息。
            </Text>

            {/* 不限制开关 */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchLabel}>不限制上下文</Text>
                <Text style={styles.switchSubLabel}>记住所有历史消息</Text>
              </View>
              <Switch
                value={isUnlimited}
                onValueChange={toggleUnlimited}
                disabled={isLoading}
                trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
                thumbColor={isUnlimited ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {/* 上下文条数输入 */}
            {!isUnlimited && (
              <View style={styles.contextInputContainer}>
                <Text style={styles.contextInputLabel}>上下文条数</Text>
                <View style={styles.contextInputRow}>
                  <TextInput
                    style={styles.contextInput}
                    value={contextLimit?.toString() || ''}
                    onChangeText={handleContextLimitChange}
                    placeholder="1"
                    keyboardType="numeric"
                    maxLength={3}
                    editable={!isLoading}
                  />
                  <Text style={styles.contextInputUnit}>条</Text>
                </View>
              </View>
            )}

            {/* 示例说明 */}
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>示例说明：</Text>
              <Text style={styles.exampleText}>
                • 设置为 1：每次对话都是独立的，AI不会记住之前的内容
              </Text>
              <Text style={styles.exampleText}>
                • 设置为 3：AI会记住最近的3条对话（包括用户和AI的回复）
              </Text>
              <Text style={styles.exampleText}>
                • 不限制：AI会记住所有历史对话，直到手动清除上下文
              </Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  switchSubLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contextInputContainer: {
    marginTop: 8,
  },
  contextInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  contextInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    width: 80,
    textAlign: 'center',
  },
  contextInputUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  exampleContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
});
