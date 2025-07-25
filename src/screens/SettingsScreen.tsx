import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../contexts/AppContext';

type SettingsStackParamList = {
  SettingsMain: undefined;
  ApiConfig: undefined;
  DataManagement: undefined;
};

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

const SettingsScreen: React.FC<{ navigation: SettingsScreenNavigationProp }> = ({ navigation }) => {
  const { config, messages } = useApp();

  const navigateToApiConfig = () => {
    console.log('Navigating to ApiConfig...');
    try {
      navigation.navigate('ApiConfig');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const navigateToDataManagement = () => {
    console.log('Navigating to DataManagement...');
    try {
      navigation.navigate('DataManagement');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const getConfigStatus = () => {
    if (!config.apiKey || !config.baseUrl) {
      return { status: '未配置', color: '#FF3B30', icon: 'warning-outline' };
    }
    return { status: '已配置', color: '#34C759', icon: 'checkmark-circle-outline' };
  };

  const getDataStats = () => {
    const messageCount = messages.length;
    return {
      count: messageCount,
      status: messageCount > 0 ? `${messageCount} 条消息` : '暂无数据',
    };
  };

  const configStatus = getConfigStatus();
  const dataStats = getDataStats();

  return (
    <View style={styles.container}>
      {/* 设置状态栏样式 */}
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* 自定义标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>设置</Text>
      </View>

      <ScrollView style={styles.scrollView}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配置管理</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={navigateToApiConfig}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="key-outline" size={24} color="#007AFF" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>API 配置</Text>
            <Text style={styles.menuSubtitle}>配置API Key、Base URL和模型</Text>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={configStatus.icon as any} 
                size={16} 
                color={configStatus.color} 
              />
              <Text style={[styles.statusText, { color: configStatus.color }]}>
                {configStatus.status}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据管理</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={navigateToDataManagement}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="folder-outline" size={24} color="#34C759" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>数据管理</Text>
            <Text style={styles.menuSubtitle}>管理聊天记录和应用数据</Text>
            <View style={styles.statusContainer}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.statusText}>
                {dataStats.status}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>


    </ScrollView>
    </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  infoContainer: {
    // 可以添加特定样式
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default SettingsScreen;
