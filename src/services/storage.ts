import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatConfig, ChatGroup } from '../types';

const STORAGE_KEYS = {
  MESSAGES: '@melonwise_messages',
  CONFIG: '@melonwise_config',
  CHAT_GROUPS: '@melonwise_chat_groups',
};

export class StorageService {
  static async saveMessages(messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  static async loadMessages(): Promise<Message[]> {
    try {
      const messagesJson = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
      return messagesJson ? JSON.parse(messagesJson) : [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  static async saveConfig(config: ChatConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  static async loadConfig(): Promise<ChatConfig | null> {
    try {
      const configJson = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
      return configJson ? JSON.parse(configJson) : null;
    } catch (error) {
      console.error('Error loading config:', error);
      return null;
    }
  }

  static async saveChatGroups(groups: ChatGroup[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving chat groups:', error);
    }
  }

  static async loadChatGroups(): Promise<ChatGroup[]> {
    try {
      const groupsJson = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_GROUPS);
      return groupsJson ? JSON.parse(groupsJson) : [];
    } catch (error) {
      console.error('Error loading chat groups:', error);
      return [];
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.MESSAGES, STORAGE_KEYS.CONFIG, STORAGE_KEYS.CHAT_GROUPS]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}
