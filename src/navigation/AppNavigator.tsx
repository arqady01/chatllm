import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatGroupsScreen from '../screens/ChatGroupsScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatSettingsScreen from '../screens/ChatSettingsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ApiConfigScreen from '../screens/ApiConfigScreen';
import DataManagementScreen from '../screens/DataManagementScreen';
import { ChatGroup } from '../types';

// 定义导航参数类型
export type ChatStackParamList = {
  ChatGroups: undefined;
  Chat: { groupId: string; groupName: string };
  ChatSettings: { chatGroup: ChatGroup };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ApiConfig: undefined;
  DataManagement: undefined;
};

const Tab = createBottomTabNavigator();
const ChatStack = createStackNavigator<ChatStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// 聊天页面的堆栈导航
const ChatStackNavigator: React.FC = () => {
  return (
    <ChatStack.Navigator
      initialRouteName="ChatGroups"
      screenOptions={{
        headerShown: false,
      }}
    >
      <ChatStack.Screen
        name="ChatGroups"
        component={ChatGroupsScreen}
        options={{
          headerShown: false
        }}
      />
      <ChatStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false
        }}
      />
      <ChatStack.Screen
        name="ChatSettings"
        component={ChatSettingsScreen}
        options={{
          headerShown: false
        }}
      />
    </ChatStack.Navigator>
  );
};

// 设置页面的堆栈导航
const SettingsStackNavigator: React.FC = () => {
  return (
    <SettingsStack.Navigator
      initialRouteName="SettingsMain"
      screenOptions={{
        headerShown: false, // 隐藏所有header
      }}
    >
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          headerShown: false
        }}
      />
      <SettingsStack.Screen
        name="ApiConfig"
        component={ApiConfigScreen}
        options={{
          headerShown: false
        }}
      />
      <SettingsStack.Screen
        name="DataManagement"
        component={DataManagementScreen}
        options={{
          headerShown: false
        }}
      />
    </SettingsStack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'ChatTab') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: 'gray',
          headerShown: false, // 隐藏Tab导航的header，使用Stack导航的header
          // 根据当前路由动态隐藏Tab栏
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? '';
            if (routeName === 'Chat' || routeName === 'ChatSettings') {
              return { display: 'none' };
            }
            return {};
          })(route),
        })}
      >
        <Tab.Screen
          name="ChatTab"
          component={ChatStackNavigator}
          options={{
            title: '聊天',
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStackNavigator}
          options={{
            title: '设置',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
