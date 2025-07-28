import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { ChatGroup } from '../types';
import { ChatStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';

type ChatSettingsScreenRouteProp = RouteProp<ChatStackParamList, 'ChatSettings'>;
type ChatSettingsScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'ChatSettings'>;

interface ChatSettingsScreenProps {
  route: ChatSettingsScreenRouteProp;
  navigation: ChatSettingsScreenNavigationProp;
}

const ChatSettingsScreen: React.FC<ChatSettingsScreenProps> = ({ route, navigation }) => {
  const { chatGroup } = route.params;
  const { updateChatGroup } = useApp();

  // 计算滑块值的辅助函数
  const getSliderValueFromContextLimit = (contextLimit: number | undefined): number => {
    if (contextLimit === undefined) {
      return 51; // 滑块最右端表示无限制
    } else {
      // 将上下文限制映射到滑块值（0-50）
      return Math.min(Math.max(contextLimit, 0), 50);
    }
  };

  const [groupName, setGroupName] = useState(chatGroup.name);
  const [contextSliderValue, setContextSliderValue] = useState<number>(() => 
    getSliderValueFromContextLimit(chatGroup.contextLimit)
  );
  const [temperature, setTemperature] = useState<number>(() =>
    chatGroup.temperature !== undefined ? chatGroup.temperature : 0.7
  );
  const [isLoading, setIsLoading] = useState(false);
  const [forceRenderKey, setForceRenderKey] = useState(0);
  const [sliderReady, setSliderReady] = useState(false);

  // 当chatGroup变化时更新状态
  useEffect(() => {
    setGroupName(chatGroup.name);

    // 先隐藏滑块
    setSliderReady(false);

    // 计算并设置滑块值
    const sliderValue = getSliderValueFromContextLimit(chatGroup.contextLimit);
    setContextSliderValue(sliderValue);

    // 设置温度值
    const tempValue = chatGroup.temperature !== undefined ? chatGroup.temperature : 0.7;
    setTemperature(tempValue);

    // 延迟渲染滑块以修复位置bug
    setForceRenderKey(prev => prev + 1);

    // 使用setTimeout确保状态完全更新后再显示滑块
    setTimeout(() => {
      setSliderReady(true);
    }, 100);
  }, [chatGroup]);

  // 处理上下文滑块值变化
  const handleContextSliderChange = (value: number) => {
    setContextSliderValue(value);
  };

  // 处理保存
  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('错误', '请输入聊天组名称');
      return;
    }

    setIsLoading(true);

    try {
      // 从滑块值获取上下文限制
      let contextLimit: number | undefined;
      if (contextSliderValue === 51) {
        // 滑块值为51表示无限制
        contextLimit = undefined;
      } else {
        // 滑块值0-50表示具体条数（包括0表示不记住历史）
        contextLimit = Math.round(contextSliderValue);
      }

      const updatedGroup: ChatGroup = {
        ...chatGroup,
        name: groupName.trim(),
        contextLimit,
        temperature,
        updatedAt: Date.now(),
      };

      // 调用实际的保存API
      await updateChatGroup(updatedGroup);

      Alert.alert('成功', '设置已保存', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('保存聊天组设置失败:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 导航头部 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>聊天设置</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

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
            <Text style={styles.sectionTitle}>上下文记忆</Text>
            <Text style={styles.sectionDescription}>
              设置AI记住多少条历史对话，影响对话的连贯性和成本
            </Text>

            {/* 当前设置显示 */}
            <View style={styles.contextHeader}>
              <Text style={styles.contextLabel}>当前设置</Text>
              <Text style={styles.contextValue}>
                {contextSliderValue === 51 ? '无限制' :
                 contextSliderValue === 0 ? '不记住历史' :
                 `${Math.round(contextSliderValue)} 条`}
              </Text>
            </View>

            {/* 上下文滑块 */}
            <View style={styles.sliderContainer}>
              {sliderReady && (
                <Slider
                key={`context-slider-${chatGroup.id}-${chatGroup.contextLimit}-${forceRenderKey}`}
                style={styles.slider}
                value={contextSliderValue}
                onValueChange={handleContextSliderChange}
                onSlidingStart={() => {
                  // 滑块开始拖动
                }}
                onSlidingComplete={(value) => {
                  setContextSliderValue(value);
                }}
                minimumValue={0}
                maximumValue={51}
                step={1}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
                disabled={isLoading}
                />
              )}
            </View>

            {/* 标签 */}
            <View style={styles.labelsContainer}>
              <Text style={styles.label}>不记住</Text>
              <Text style={styles.label}>17条</Text>
              <Text style={styles.label}>34条</Text>
              <Text style={styles.label}>无限制</Text>
            </View>
          </View>

          {/* 温度设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>创造性 (Temperature)</Text>
            <Text style={styles.sectionDescription}>
              控制AI回答的创造性，数值越高越有创意，越低越保守
            </Text>

            {/* 当前温度显示 */}
            <View style={styles.contextHeader}>
              <Text style={styles.contextLabel}>当前设置</Text>
              <Text style={styles.contextValue}>{temperature.toFixed(1)}</Text>
            </View>

            {/* 温度滑块 */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={temperature}
                onValueChange={(value) => {
                  // 修复浮点数精度问题
                  const roundedValue = Math.round(value * 10) / 10;
                  setTemperature(roundedValue);
                }}
                minimumValue={0}
                maximumValue={1}
                step={0.1}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
                disabled={isLoading}
              />
            </View>

            {/* 温度标签 */}
            <View style={styles.labelsContainer}>
              <Text style={styles.label}>保守</Text>
              <Text style={styles.label}>平衡</Text>
              <Text style={styles.label}>创意</Text>
            </View>
          </View>

          {/* 按钮区域 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40, // 占位，保持标题居中
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  contextLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  contextValue: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  sliderContainer: {
    marginVertical: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ChatSettingsScreen;
