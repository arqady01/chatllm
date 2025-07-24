import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';

const DataManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { messages, clearMessages } = useApp();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearMessages = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有聊天记录吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearMessages();
              Alert.alert('成功', '聊天记录已清除', [
                {
                  text: '确定',
                  onPress: () => navigation.goBack(),
                }
              ]);
            } catch (error) {
              Alert.alert('错误', '清除失败，请重试');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    // 未来功能：导出聊天记录
    Alert.alert('功能开发中', '数据导出功能正在开发中，敬请期待！');
  };

  const handleImportData = () => {
    // 未来功能：导入聊天记录
    Alert.alert('功能开发中', '数据导入功能正在开发中，敬请期待！');
  };

  const getDataStats = () => {
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;
    
    return {
      total: messageCount,
      user: userMessages,
      assistant: assistantMessages,
    };
  };

  const stats = getDataStats();

  return (
    <View style={styles.container}>
      {/* 自定义标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>数据管理</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 数据统计</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>总消息数</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.user}</Text>
            <Text style={styles.statLabel}>用户消息</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.assistant}</Text>
            <Text style={styles.statLabel}>AI回复</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗂️ 数据管理</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={handleExportData}
        >
          <Ionicons name="download-outline" size={24} color="#007AFF" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>导出聊天记录</Text>
            <Text style={styles.actionSubtitle}>将聊天记录导出为文件</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.importButton]}
          onPress={handleImportData}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#34C759" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>导入聊天记录</Text>
            <Text style={styles.actionSubtitle}>从文件导入聊天记录</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ 危险操作</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleClearMessages}
          disabled={isClearing}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, styles.dangerText]}>
              {isClearing ? '清除中...' : '清除所有聊天记录'}
            </Text>
            <Text style={styles.actionSubtitle}>
              此操作不可撤销，请谨慎操作
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ 存储信息</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>存储位置</Text>
            <Text style={styles.infoValue}>设备本地存储</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>数据加密</Text>
            <Text style={styles.infoValue}>是</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>云端同步</Text>
            <Text style={styles.infoValue}>否（计划中）</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>自动备份</Text>
            <Text style={styles.infoValue}>否（计划中）</Text>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  exportButton: {
    // 可以添加特定样式
  },
  importButton: {
    // 可以添加特定样式
  },
  dangerButton: {
    // 可以添加特定样式
  },
  dangerText: {
    color: '#FF3B30',
  },
  infoContainer: {
    // 可以添加特定样式
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
  },
});

export default DataManagementScreen;
