import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { ModelInfo } from '../types';
import BaseUrlGuide from '../components/BaseUrlGuide';

const ApiConfigScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { config, updateConfig, testConnection, getAvailableModels, detectBaseUrl } = useApp();
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [model, setModel] = useState(config.model);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isDetectingUrl, setIsDetectingUrl] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('错误', '请输入API Key');
      return;
    }

    if (!baseUrl.trim()) {
      Alert.alert('错误', '请输入Base URL');
      return;
    }

    const newConfig = {
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim().replace(/\/$/, ''), // Remove trailing slash
      model: model.trim() || 'gpt-3.5-turbo',
    };

    await updateConfig(newConfig);
    Alert.alert('成功', '设置已保存', [
      {
        text: '确定',
        onPress: () => navigation.goBack(),
      }
    ]);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !baseUrl.trim()) {
      Alert.alert('错误', '请先填写API Key和Base URL');
      return;
    }

    setIsTestingConnection(true);
    
    const tempConfig = {
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim().replace(/\/$/, ''),
      model: model.trim() || 'gpt-3.5-turbo',
    };

    await updateConfig(tempConfig);
    
    try {
      const isConnected = await testConnection();
      Alert.alert(
        isConnected ? '连接成功' : '连接失败',
        isConnected ? 'API连接正常' : '请检查API Key和Base URL是否正确'
      );
    } catch (error) {
      Alert.alert('连接失败', '请检查网络连接和API配置');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleDetectBaseUrl = async () => {
    if (!apiKey.trim()) {
      Alert.alert('错误', '请先填写API Key');
      return;
    }

    if (!baseUrl.trim()) {
      Alert.alert('错误', '请先填写Base URL');
      return;
    }

    setIsDetectingUrl(true);

    try {
      const result = await detectBaseUrl(baseUrl.trim(), apiKey.trim());
      
      if (result.isValid) {
        setBaseUrl(result.baseUrl);
        
        let message = '';
        if (result.isForceMode) {
          message = `🔒 强制模式检测成功！\n\n使用完整URL: ${result.baseUrl}\n\n注意：强制模式下不会自动添加任何端点路径。`;
        } else {
          message = `检测成功！\n正确的Base URL: ${result.baseUrl}`;
          if (result.detectedEndpoints.length > 1) {
            message += `\n\n发现 ${result.detectedEndpoints.length} 个可用端点：\n${result.detectedEndpoints.join('\n')}`;
          }
        }
        
        Alert.alert('Base URL检测成功', message, [
          {
            text: '确定',
            onPress: () => {
              // 自动保存检测到的正确URL
              const newConfig = {
                apiKey: apiKey.trim(),
                baseUrl: result.baseUrl,
                model: model.trim() || 'gpt-3.5-turbo',
              };
              updateConfig(newConfig);
            }
          }
        ]);
      } else {
        let errorMessage = '无法找到有效的API端点。请检查：\n\n1. URL是否正确\n2. API Key是否有效\n3. 网络连接是否正常\n4. 服务是否支持OpenAI格式';
        
        if (result.errorDetails) {
          errorMessage += `\n\n详细错误信息：\n${result.errorDetails}`;
        }
        
        Alert.alert('Base URL检测失败', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '检测失败';
      Alert.alert('Base URL检测失败', errorMessage);
    } finally {
      setIsDetectingUrl(false);
    }
  };

  const handleFetchModels = async () => {
    if (!apiKey.trim() || !baseUrl.trim()) {
      Alert.alert('错误', '请先填写API Key和Base URL');
      return;
    }

    setIsFetchingModels(true);
    
    // 临时更新配置以获取模型
    const tempConfig = {
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim().replace(/\/$/, ''),
      model: model.trim() || 'gpt-3.5-turbo',
    };

    await updateConfig(tempConfig);

    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
      
      if (models.length === 0) {
        Alert.alert('提示', '未找到可用的聊天模型');
      } else {
        Alert.alert('成功', `获取到 ${models.length} 个可用模型`);
        setShowModelPicker(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取模型失败';
      Alert.alert('获取模型失败', errorMessage);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSelectModel = (selectedModel: ModelInfo) => {
    setModel(selectedModel.id);
    setShowModelPicker(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 自定义标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API 配置</Text>
        <View style={styles.headerRight} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Key *</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="请输入您的API Key"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Base URL *</Text>
            <View style={styles.urlInputContainer}>
              <TextInput
                style={[styles.input, styles.urlInput]}
                value={baseUrl}
                onChangeText={setBaseUrl}
                placeholder="https://api.openai.com/v1"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.detectUrlButton, isDetectingUrl && styles.detectUrlButtonDisabled]}
                onPress={handleDetectBaseUrl}
                disabled={isDetectingUrl}
              >
                <Ionicons 
                  name={isDetectingUrl ? "refresh" : "search-outline"} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.detectUrlButtonText}>
                  {isDetectingUrl ? '检测中...' : '智能检测'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.urlHint}>
              💡 智能模式：输入域名（如：https://api.example.com），点击"智能检测"自动找到正确端点{'\n'}
              🔒 强制模式：输入完整URL并在末尾加#号（如：https://api.example.com/v1/chat/completions#）强制使用指定URL
            </Text>
            <BaseUrlGuide onSelectExample={setBaseUrl} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>模型</Text>
            <View style={styles.modelInputContainer}>
              <TextInput
                style={[styles.input, styles.modelInput]}
                value={model}
                onChangeText={setModel}
                placeholder="gpt-3.5-turbo"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.fetchModelsButton, isFetchingModels && styles.fetchModelsButtonDisabled]}
                onPress={handleFetchModels}
                disabled={isFetchingModels}
              >
                <Ionicons 
                  name={isFetchingModels ? "refresh" : "download-outline"} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.fetchModelsButtonText}>
                  {isFetchingModels ? '获取中...' : '获取模型'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={handleTestConnection}
            disabled={isTestingConnection}
          >
            <Text style={styles.buttonText}>
              {isTestingConnection ? '测试中...' : '测试连接'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>保存设置</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 模型选择器 Modal */}
      <Modal
        visible={showModelPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModelPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>选择模型</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModelPicker(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableModels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modelItem,
                  item.id === model && styles.modelItemSelected
                ]}
                onPress={() => handleSelectModel(item)}
              >
                <View style={styles.modelItemContent}>
                  <Text style={[
                    styles.modelItemTitle,
                    item.id === model && styles.modelItemTitleSelected
                  ]}>
                    {item.id}
                  </Text>
                  <Text style={[
                    styles.modelItemSubtitle,
                    item.id === model && styles.modelItemSubtitleSelected
                  ]}>
                    由 {item.owned_by} 提供
                  </Text>
                </View>
                {item.id === model && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urlInput: {
    flex: 1,
  },
  detectUrlButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detectUrlButtonDisabled: {
    backgroundColor: '#ccc',
  },
  detectUrlButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  urlHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  modelInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelInput: {
    flex: 1,
  },
  fetchModelsButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fetchModelsButtonDisabled: {
    backgroundColor: '#ccc',
  },
  fetchModelsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  testButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  modelItem: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modelItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  modelItemContent: {
    flex: 1,
  },
  modelItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  modelItemTitleSelected: {
    color: '#007AFF',
  },
  modelItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modelItemSubtitleSelected: {
    color: '#007AFF',
  },
});

export default ApiConfigScreen;
