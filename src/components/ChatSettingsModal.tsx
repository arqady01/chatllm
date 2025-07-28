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
import Slider from '@react-native-community/slider';
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
  const [contextSliderValue, setContextSliderValue] = useState<number>(10); // 滑块值，范围0-50，0表示无限制
  const [temperature, setTemperature] = useState<number>(0.7);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setGroupName(chatGroup.name);
      // 将上下文限制转换为滑块值
      if (chatGroup.contextLimit === undefined) {
        setContextSliderValue(0); // 滑块最左端表示无限制
      } else {
        // 将上下文限制映射到滑块值（1-50）
        setContextSliderValue(Math.min(Math.max(chatGroup.contextLimit, 1), 50));
      }
      // 初始化温度值
      setTemperature(chatGroup.temperature !== undefined ? chatGroup.temperature : 0.7);
    }
  }, [visible, chatGroup]);

  // 处理上下文滑块值变化
  const handleContextSliderChange = (value: number) => {
    setContextSliderValue(value);
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('错误', '对话组名称不能为空');
      return;
    }

    // 从滑块值获取上下文限制
    let contextLimit: number | undefined;
    if (contextSliderValue === 0) {
      // 滑块值为0表示无限制
      contextLimit = undefined;
    } else {
      // 滑块值1-50表示具体条数
      contextLimit = Math.round(contextSliderValue);
    }

    setIsLoading(true);
    try {
      const updatedGroup: ChatGroup = {
        ...chatGroup,
        name: groupName.trim(),
        contextLimit,
        temperature,
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

          {/* 上下文条数控制 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>上下文条数控制</Text>
            <Text style={styles.sectionDescription}>
              控制AI在对话中能记住多少条历史消息。滑动到最左端表示无限制，右侧数值表示具体条数（1-50条）。
            </Text>

            {/* 上下文值显示 */}
            <View style={styles.contextHeader}>
              <Text style={styles.contextLabel}>当前设置</Text>
              <Text style={styles.contextValue}>
                {contextSliderValue === 0 ? '无限制' : `${Math.round(contextSliderValue)} 条`}
              </Text>
            </View>

            {/* 上下文滑块 */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                value={contextSliderValue}
                onValueChange={handleContextSliderChange}
                minimumValue={0}
                maximumValue={50}
                step={1}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
                disabled={isLoading}
              />
            </View>

            {/* 滑块标签 */}
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>无限制</Text>
              <Text style={styles.sliderLabelText}>17条</Text>
              <Text style={styles.sliderLabelText}>33条</Text>
              <Text style={styles.sliderLabelText}>50条</Text>
            </View>
          </View>

          {/* 温度控制 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>温度控制</Text>
            <Text style={styles.sectionDescription}>
              控制AI输出的随机性和创造力。较高的温度值（接近1.0）使输出更随机、创造力更强；较低的温度值（接近0.0）则使输出更集中、确定性更强。
            </Text>

            {/* 温度值显示 */}
            <View style={styles.temperatureHeader}>
              <Text style={styles.temperatureLabel}>当前温度值</Text>
              <Text style={styles.temperatureValue}>{temperature.toFixed(1)}</Text>
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
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
                disabled={isLoading}
              />
            </View>

            {/* 温度滑块标签 */}
            <View style={styles.temperatureSliderLabels}>
              <Text style={styles.sliderLabelText}>0.0</Text>
              <Text style={styles.sliderLabelText}>0.3</Text>
              <Text style={styles.sliderLabelText}>0.7</Text>
              <Text style={styles.sliderLabelText}>1.0</Text>
            </View>



            {/* 温度值说明 */}
            <View style={styles.temperatureGuide}>
              <View style={styles.temperatureGuideItem}>
                <Text style={styles.temperatureGuideLabel}>0.0 - 0.3</Text>
                <Text style={styles.temperatureGuideDesc}>确定性强，适合事实性问答</Text>
              </View>
              <View style={styles.temperatureGuideItem}>
                <Text style={styles.temperatureGuideLabel}>0.4 - 0.7</Text>
                <Text style={styles.temperatureGuideDesc}>平衡模式，适合日常对话</Text>
              </View>
              <View style={styles.temperatureGuideItem}>
                <Text style={styles.temperatureGuideLabel}>0.8 - 1.0</Text>
                <Text style={styles.temperatureGuideDesc}>创造性强，适合创意写作</Text>
              </View>
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
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  contextLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  contextValue: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  sliderContainer: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#007AFF',
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 16,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  temperatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperatureLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  temperatureValue: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  temperatureSliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 16,
  },
  temperatureGuide: {
    marginTop: 16,
  },
  temperatureGuideItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  temperatureGuideLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    minWidth: 80,
  },
  temperatureGuideDesc: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
});
