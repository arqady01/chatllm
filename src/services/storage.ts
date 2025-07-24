import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatConfig } from '../types';

const STORAGE_KEYS = {
  MESSAGES: '@melonwise_messages',
  CONFIG: '@melonwise_config',
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

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.MESSAGES, STORAGE_KEYS.CONFIG]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}
