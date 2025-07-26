import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { AppProvider } from './src/contexts/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  // 应用启动时立即设置StatusBar
  useEffect(() => {
    StatusBar.setBarStyle('dark-content', false);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#f5f5f5', false);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </ErrorBoundary>
  );
}
