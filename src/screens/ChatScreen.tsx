import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../contexts/AppContext';
import MessageBubble from '../components/MessageBubble';
import { Message } from '../types';
import { ChatStackParamList } from '../navigation/AppNavigator';

type ChatScreenRouteProp = RouteProp<ChatStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'Chat'>;

interface ChatScreenProps {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const { messages, isLoading, error, sendMessage, config, clearContext, getGroupMessages } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string>('image/jpeg');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 获取当前组的消息
  const groupMessages = getGroupMessages(groupId);

  useEffect(() => {
    if (groupMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [groupMessages]);

  // 将图片转换为base64 - 参考Python代码逻辑，并添加大小限制
  const encodeImageToBase64 = async (uri: string): Promise<{ base64: string; mimeType: string }> => {
    try {
      console.log('Converting image to base64:', uri);

      // 直接读取图片文件并转换为base64，类似Python的做法
      const response = await fetch(uri);
      const blob = await response.blob();

      // 检查文件大小（限制为5MB）
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (blob.size > maxSize) {
        console.warn(`Image size ${blob.size} bytes exceeds limit ${maxSize} bytes`);
        Alert.alert('图片过大', '图片大小不能超过5MB，请选择较小的图片');
        return { base64: '', mimeType: '' };
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // 提取MIME类型和base64数据
          const [header, base64Data] = result.split(',');
          const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';

          console.log(`Base64 size: ${base64Data.length} bytes`);
          console.log(`MIME type: ${mimeType}`);

          resolve({ base64: base64Data, mimeType });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error encoding image to base64:', error);
      return { base64: '', mimeType: '' };
    }
  };

  // 请求图片权限
  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限需要', '需要访问相册权限才能选择图片');
      return false;
    }
    return true;
  };

  // 选择图片
  const pickImage = async () => {
    console.log('pickImage called');
    try {
      const hasPermission = await requestImagePermission();
      console.log('Permission result:', hasPermission);
      if (!hasPermission) return;

      console.log('Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // 不显示裁剪框
        quality: 0.8, // 适中的质量，避免文件过大
        base64: false, // 不需要base64，后续手动转换
        exif: false, // 不包含EXIF数据
      });

      console.log('Image picker result:', result);
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Selected image asset:', asset.uri);

        // 转换为base64
        const { base64, mimeType } = await encodeImageToBase64(asset.uri);
        if (base64) {
          setSelectedImage(asset.uri);
          setSelectedImageBase64(base64);
          setSelectedImageMimeType(mimeType);
          setShowImagePreview(true);
        }
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert('错误', '选择图片时出现错误');
    }
  };

  // 拍照
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限需要', '需要访问相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // 不显示裁剪框
      quality: 0.8, // 适中的质量，避免文件过大
      base64: false, // 不需要base64，后续手动转换
      exif: false, // 不包含EXIF数据
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // 转换为base64
      const { base64, mimeType } = await encodeImageToBase64(asset.uri);
      if (base64) {
        setSelectedImage(asset.uri);
        setSelectedImageBase64(base64);
        setSelectedImageMimeType(mimeType);
        setShowImagePreview(true);
      }
    }
  };

  // 显示图片选择选项
  const showImageOptions = () => {
    console.log('showImageOptions called');
    Alert.alert(
      '选择图片',
      '请选择图片来源',
      [
        { text: '取消', style: 'cancel' },
        { text: '相册', onPress: pickImage },
        { text: '拍照', onPress: takePhoto },
      ]
    );
  };

  useEffect(() => {
    if (error) {
      Alert.alert('错误', error);
    }
  }, [error]);

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImageBase64) return;

    if (!config.apiKey) {
      Alert.alert('配置错误', '请先在设置页面配置API Key');
      return;
    }

    const message = inputText.trim();
    const imageUri = selectedImage; // 用于显示的URI
    const imageBase64 = selectedImageBase64; // 用于API的base64
    const imageMimeType = selectedImageMimeType; // 图片MIME类型

    // 清空输入
    setInputText('');
    setSelectedImage(null);
    setSelectedImageBase64(null);
    setSelectedImageMimeType('image/jpeg');
    setShowImagePreview(false);

    // 发送消息（传递URI用于显示，base64用于API，MIME类型）
    await sendMessage(message, imageUri, imageBase64, imageMimeType, groupId);
  };

  // 移除选中的图片
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setSelectedImageBase64(null);
    setSelectedImageMimeType('image/jpeg');
    setShowImagePreview(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>开始对话吧！</Text>
      <Text style={styles.emptyStateSubtext}>
        {config.apiKey ? '输入消息开始聊天' : '请先在设置页面配置API Key'}
      </Text>
    </View>
  );

  const renderLoadingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>AI正在思考中...</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* 设置状态栏样式 */}
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* 自定义标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{groupName}</Text>
        <View style={styles.headerRightSpace} />
      </View>
      <FlatList
        ref={flatListRef}
        data={groupMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={groupMessages.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (groupMessages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />
      
      {renderLoadingIndicator()}

      {/* 图片预览 */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={removeSelectedImage}
            >
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入消息..."
          multiline
          maxLength={1000}
          editable={!isLoading}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            ((!inputText.trim() && !selectedImageBase64) || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={(!inputText.trim() && !selectedImageBase64) || isLoading}
        >
          <Ionicons
            name="send"
            size={20}
            color={((!inputText.trim() && !selectedImageBase64) || isLoading) ? '#ccc' : 'white'}
          />
        </TouchableOpacity>
      </View>

      {/* 底部按钮区域 */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={showImageOptions}
          disabled={isLoading}
        >
          <Ionicons
            name="image-outline"
            size={20}
            color={isLoading ? '#ccc' : '#007AFF'}
          />
          <Text style={[styles.bottomButtonText, isLoading && styles.bottomButtonTextDisabled]}>
            上传图片
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            Alert.alert(
              '重置上下文',
              '确定要重置对话上下文吗？这将清除AI的记忆，但保留聊天记录。',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '确认',
                  style: 'destructive',
                  onPress: () => {
                    clearContext(groupId);
                    // 显示成功提醒
                    Alert.alert(
                      '上下文已清除',
                      'AI的对话记忆已重置，新的对话将不会参考之前的内容。',
                      [{ text: '知道了', style: 'default' }]
                    );
                  }
                },
              ]
            );
          }}
          disabled={isLoading}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color={isLoading ? '#ccc' : '#007AFF'}
          />
          <Text style={[styles.bottomButtonText, isLoading && styles.bottomButtonTextDisabled]}>
            重置上下文
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // 适配状态栏
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRightSpace: {
    width: 40,
    height: 40,
  },
  messagesList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  imagePreviewContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imagePreview: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8f8f8',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    minWidth: 120,
    justifyContent: 'center',
  },
  bottomButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  bottomButtonTextDisabled: {
    color: '#ccc',
  },
});

export default ChatScreen;
