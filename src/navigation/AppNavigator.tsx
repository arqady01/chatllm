import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ApiConfigScreen from '../screens/ApiConfigScreen';
import DataManagementScreen from '../screens/DataManagementScreen';

// 定义导航参数类型
export type SettingsStackParamList = {
  SettingsMain: undefined;
  ApiConfig: undefined;
  DataManagement: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<SettingsStackParamList>();

// 设置页面的堆栈导航
const SettingsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsMain"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: '设置',
          headerTitle: '设置'
        }}
      />
      <Stack.Screen
        name="ApiConfig"
        component={ApiConfigScreen}
        options={{
          title: 'API 配置',
          headerTitle: 'API 配置'
        }}
      />
      <Stack.Screen
        name="DataManagement"
        component={DataManagementScreen}
        options={{
          title: '数据管理',
          headerTitle: '数据管理'
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false, // 隐藏Tab导航的header，使用Stack导航的header
        })}
      >
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: '聊天',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: 'white',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerTitle: 'MelonWise AI'
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{
            title: '设置',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
