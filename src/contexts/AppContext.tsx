import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Message, ChatConfig, AppState, ModelInfo, ChatGroup } from '../types';
import { OpenAIService } from '../services/openai';
import { StorageService } from '../services/storage';
import { ContextManager } from '../utils/contextManager';

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CONFIG'; payload: ChatConfig }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_CONTEXT_MESSAGES'; payload: Message[] }
  | { type: 'ADD_TO_CONTEXT'; payload: Message }
  | { type: 'CLEAR_CONTEXT' }
  | { type: 'CLEAR_GROUP_MESSAGES'; payload: string }
  | { type: 'SET_CHAT_GROUPS'; payload: ChatGroup[] }
  | { type: 'ADD_CHAT_GROUP'; payload: ChatGroup }
  | { type: 'DELETE_CHAT_GROUP'; payload: string }
  | { type: 'SET_CURRENT_GROUP'; payload: string | null };

interface AppContextType extends AppState {
  sendMessage: (content: string, imageUri?: string, imageBase64?: string, imageMimeType?: string, groupId?: string) => Promise<void>;
  updateConfig: (config: ChatConfig) => Promise<void>;
  clearMessages: () => Promise<void>;
  clearContext: (groupId?: string) => void;
  clearGroupMessages: (groupId: string) => Promise<void>;
  createChatGroup: (name: string, description?: string) => Promise<void>;
  deleteChatGroup: (groupId: string) => Promise<void>;
  setCurrentGroup: (groupId: string | null) => void;
  getGroupMessages: (groupId: string) => Message[];
  getContextInfo: () => { contextLength: number; totalMessages: number };
  testConnection: () => Promise<boolean>;
  getAvailableModels: () => Promise<ModelInfo[]>;
  detectBaseUrl: (inputUrl: string, apiKey: string) => Promise<{ baseUrl: string; isValid: boolean; detectedEndpoints: string[]; errorDetails?: string; isForceMode?: boolean }>;
}

const initialState: AppState = {
  messages: [],
  contextMessages: [],
  chatGroups: [],
  currentGroupId: null,
  config: {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
  },
  isLoading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], contextMessages: [] };
    case 'SET_CONTEXT_MESSAGES':
      return { ...state, contextMessages: action.payload };
    case 'ADD_TO_CONTEXT':
      return { ...state, contextMessages: [...state.contextMessages, action.payload] };
    case 'CLEAR_CONTEXT':
      return { ...state, contextMessages: [] };
    case 'CLEAR_GROUP_MESSAGES':
      // 删除指定聊天组的所有消息
      return {
        ...state,
        messages: state.messages.filter(msg => msg.groupId !== action.payload)
      };
    case 'SET_CHAT_GROUPS':
      return { ...state, chatGroups: action.payload };
    case 'ADD_CHAT_GROUP':
      return { ...state, chatGroups: [...state.chatGroups, action.payload] };
    case 'DELETE_CHAT_GROUP':
      return {
        ...state,
        chatGroups: state.chatGroups.filter(group => group.id !== action.payload),
        messages: state.messages.filter(msg => msg.groupId !== action.payload),
        currentGroupId: state.currentGroupId === action.payload ? null : state.currentGroupId
      };
    case 'SET_CURRENT_GROUP':
      return { ...state, currentGroupId: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const openAIService = new OpenAIService(state.config);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    openAIService.updateConfig(state.config);
  }, [state.config]);

  const loadInitialData = async () => {
    try {
      const [savedMessages, savedConfig, savedChatGroups] = await Promise.all([
        StorageService.loadMessages(),
        StorageService.loadConfig(),
        StorageService.loadChatGroups(),
      ]);

      if (savedMessages.length > 0) {
        dispatch({ type: 'SET_MESSAGES', payload: savedMessages });

        // 使用工具类重建上下文
        const contextMessages = ContextManager.rebuildContext(savedMessages);
        dispatch({ type: 'SET_CONTEXT_MESSAGES', payload: contextMessages });
      }

      if (savedConfig) {
        dispatch({ type: 'SET_CONFIG', payload: savedConfig });
      }

      if (savedChatGroups.length > 0) {
        dispatch({ type: 'SET_CHAT_GROUPS', payload: savedChatGroups });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const sendMessage = async (content: string, imageUri?: string, imageBase64?: string, imageMimeType?: string, groupId?: string) => {
    if (!content.trim() && !imageBase64) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      image: imageUri, // 保存URI用于显示
      imageBase64: imageBase64, // 保存base64用于API
      imageMimeType: imageMimeType || 'image/jpeg', // 保存MIME类型
      groupId: groupId || state.currentGroupId || undefined,
    };

    // 添加用户消息到显示和上下文
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'ADD_TO_CONTEXT', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // 构建当前上下文（包括刚添加的用户消息）
      const currentContextMessages = [...state.contextMessages, userMessage];

      // 使用工具类构建发送给API的消息数组
      const messages = ContextManager.buildApiMessages(currentContextMessages);

      // 检查是否有有效的消息发送
      if (messages.length === 0) {
        throw new Error('没有有效的消息可以发送');
      }

      console.log('Sending messages to API:', messages.length, 'messages');
      const response = await openAIService.sendMessage(messages);

      if (!response || !response.trim()) {
        throw new Error('API返回了空响应');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        groupId: userMessage.groupId,
      };

      // 添加助手消息到显示和上下文
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      dispatch({ type: 'ADD_TO_CONTEXT', payload: assistantMessage });

      // Save messages to storage
      const updatedMessages = [...state.messages, userMessage, assistantMessage];
      await StorageService.saveMessages(updatedMessages);
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateConfig = async (config: ChatConfig) => {
    dispatch({ type: 'SET_CONFIG', payload: config });
    await StorageService.saveConfig(config);
  };

  const clearMessages = async () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    await StorageService.saveMessages([]);
  };

  const clearContext = (groupId?: string) => {
    // 创建上下文分隔符消息
    const separatorMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: '🔄 上下文已清除 🔄',
      timestamp: Date.now(),
      isContextSeparator: true,
      groupId: groupId || state.currentGroupId || undefined,
    };

    // 清除上下文数组，添加分隔符消息到显示消息
    dispatch({ type: 'CLEAR_CONTEXT' });
    dispatch({ type: 'ADD_MESSAGE', payload: separatorMessage });
  };

  const clearGroupMessages = async (groupId: string) => {
    // 删除指定聊天组的所有消息
    dispatch({ type: 'CLEAR_GROUP_MESSAGES', payload: groupId });

    // 保存到存储
    const updatedMessages = state.messages.filter(msg => msg.groupId !== groupId);
    await StorageService.saveMessages(updatedMessages);
  };

  const createChatGroup = async (name: string, description?: string) => {
    const newGroup: ChatGroup = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageCount: 0,
    };

    dispatch({ type: 'ADD_CHAT_GROUP', payload: newGroup });

    // 保存到存储
    const updatedGroups = [...state.chatGroups, newGroup];
    await StorageService.saveChatGroups(updatedGroups);
  };

  const deleteChatGroup = async (groupId: string) => {
    dispatch({ type: 'DELETE_CHAT_GROUP', payload: groupId });

    // 保存到存储
    const updatedGroups = state.chatGroups.filter(group => group.id !== groupId);
    const updatedMessages = state.messages.filter(msg => msg.groupId !== groupId);
    await StorageService.saveChatGroups(updatedGroups);
    await StorageService.saveMessages(updatedMessages);
  };

  const setCurrentGroup = (groupId: string | null) => {
    dispatch({ type: 'SET_CURRENT_GROUP', payload: groupId });
  };

  const getGroupMessages = (groupId: string): Message[] => {
    return state.messages.filter(msg => msg.groupId === groupId);
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      return await openAIService.testConnection();
    } catch (error) {
      return false;
    }
  };

  const getAvailableModels = async (): Promise<ModelInfo[]> => {
    try {
      return await openAIService.getAvailableModels();
    } catch (error) {
      console.error('Failed to get available models:', error);
      throw error;
    }
  };

  const detectBaseUrl = async (inputUrl: string, apiKey: string) => {
    try {
      return await openAIService.detectAndFixBaseUrl(inputUrl, apiKey);
    } catch (error) {
      console.error('Failed to detect base URL:', error);
      throw error;
    }
  };

  const getContextInfo = () => {
    const stats = ContextManager.getContextStats(state.contextMessages, state.messages);
    console.log('Context info:', stats);
    return stats;
  };

  const contextValue: AppContextType = {
    ...state,
    sendMessage,
    updateConfig,
    clearMessages,
    clearContext,
    clearGroupMessages,
    createChatGroup,
    deleteChatGroup,
    setCurrentGroup,
    getGroupMessages,
    getContextInfo,
    testConnection,
    getAvailableModels,
    detectBaseUrl,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
