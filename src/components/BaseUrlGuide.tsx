import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BaseUrlGuideProps {
  onSelectExample: (url: string) => void;
}

const BaseUrlGuide: React.FC<BaseUrlGuideProps> = ({ onSelectExample }) => {
  const [showGuide, setShowGuide] = useState(false);

  const examples = [
    {
      name: 'OpenAI 官方',
      url: 'https://api.openai.com',
      description: '官方API服务',
    },
    {
      name: 'Azure OpenAI',
      url: 'https://your-resource.openai.azure.com',
      description: '微软Azure托管的OpenAI服务',
    },
    {
      name: '代理服务示例1',
      url: 'https://api.example.com',
      description: '第三方代理服务',
    },
    {
      name: '代理服务示例2',
      url: 'https://example.com/openai',
      description: '带路径的代理服务',
    },
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => setShowGuide(true)}
      >
        <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.helpButtonText}>Base URL 示例</Text>
      </TouchableOpacity>

      <Modal
        visible={showGuide}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGuide(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Base URL 配置指南</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGuide(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 智能检测功能</Text>
              <Text style={styles.sectionText}>
                只需输入域名部分，点击"智能检测"按钮，系统会自动尝试以下常见端点格式：
              </Text>
              <View style={styles.endpointList}>
                <Text style={styles.endpointItem}>• https://your-domain.com/v1</Text>
                <Text style={styles.endpointItem}>• https://your-domain.com</Text>
                <Text style={styles.endpointItem}>• https://your-domain.com/api/v1</Text>
                <Text style={styles.endpointItem}>• https://your-domain.com/openai/v1</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔒 强制模式（高级功能）</Text>
              <Text style={styles.sectionText}>
                如果您知道确切的API端点，可以使用强制模式：
              </Text>
              <View style={styles.endpointList}>
                <Text style={styles.endpointItem}>输入完整URL + # 号</Text>
                <Text style={styles.endpointItem}>例如：https://api.example.com/v1/chat/completions#</Text>
                <Text style={styles.endpointItem}>系统将直接使用指定的完整URL</Text>
                <Text style={styles.endpointItem}>不会自动添加任何端点路径</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 常见示例</Text>
              {examples.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => {
                    onSelectExample(example.url);
                    setShowGuide(false);
                  }}
                >
                  <View style={styles.exampleContent}>
                    <Text style={styles.exampleName}>{example.name}</Text>
                    <Text style={styles.exampleUrl}>{example.url}</Text>
                    <Text style={styles.exampleDescription}>{example.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ 注意事项</Text>
              <Text style={styles.sectionText}>
                • 智能模式：不要包含具体的API路径（如 /chat/completions）{'\n'}
                • 强制模式：必须包含完整的API路径并以#号结尾{'\n'}
                • 确保URL以 https:// 开头{'\n'}
                • 使用智能检测功能可以自动找到正确端点{'\n'}
                • 如果检测失败，请检查API Key和网络连接
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  helpButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  endpointList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  endpointItem: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exampleContent: {
    flex: 1,
  },
  exampleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  exampleUrl: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  exampleDescription: {
    fontSize: 12,
    color: '#666',
  },
});

export default BaseUrlGuide;
