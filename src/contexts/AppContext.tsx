import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Message, ChatConfig, AppState, ModelInfo } from '../types';
import { OpenAIService } from '../services/openai';
import { StorageService } from '../services/storage';

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CONFIG'; payload: ChatConfig }
  | { type: 'CLEAR_MESSAGES' };

interface AppContextType extends AppState {
  sendMessage: (content: string) => Promise<void>;
  updateConfig: (config: ChatConfig) => Promise<void>;
  clearMessages: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  getAvailableModels: () => Promise<ModelInfo[]>;
  detectBaseUrl: (inputUrl: string, apiKey: string) => Promise<{ baseUrl: string; isValid: boolean; detectedEndpoints: string[]; errorDetails?: string; isForceMode?: boolean }>;
}

const initialState: AppState = {
  messages: [],
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
      return { ...state, messages: [] };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
      const [savedMessages, savedConfig] = await Promise.all([
        StorageService.loadMessages(),
        StorageService.loadConfig(),
      ]);

      if (savedMessages.length > 0) {
        dispatch({ type: 'SET_MESSAGES', payload: savedMessages });
      }

      if (savedConfig) {
        dispatch({ type: 'SET_CONFIG', payload: savedConfig });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const messages = [...state.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await openAIService.sendMessage(messages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      
      // Save messages to storage
      const updatedMessages = [...state.messages, userMessage, assistantMessage];
      await StorageService.saveMessages(updatedMessages);
    } catch (error) {
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

  const contextValue: AppContextType = {
    ...state,
    sendMessage,
    updateConfig,
    clearMessages,
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
