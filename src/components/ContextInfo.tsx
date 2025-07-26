import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppContext } from '../contexts/AppContext';

interface ContextInfoProps {
  onClearContext?: () => void;
}

export const ContextInfo: React.FC<ContextInfoProps> = ({ onClearContext }) => {
  const { getContextInfo, clearContext } = useAppContext();
  const { contextLength, totalMessages } = getContextInfo();

  const handleClearContext = () => {
    clearContext();
    onClearContext?.();
  };

  if (contextLength === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          上下文: {contextLength} 条消息 / 总计: {totalMessages} 条
        </Text>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClearContext}
        >
          <Text style={styles.clearButtonText}>清除上下文</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
});
