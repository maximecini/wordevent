import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapScreen } from '../screens/map/MapScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useSocket } from '../hooks/useSocket';

export type MapStackParamList = {
  MapMain: undefined;
  Chat: { eventId: string; eventTitle: string };
};

export type AppTabParamList = {
  MapStack: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const MapStack = createNativeStackNavigator<MapStackParamList>();

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="MapMain" component={MapScreen} />
      <MapStack.Screen name="Chat" component={ChatScreen} />
    </MapStack.Navigator>
  );
}

/** Navigation principale — tab bar. */
export function AppNavigator() {
  useSocket();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#fff', height: 72 + insets.bottom, paddingBottom: insets.bottom + 8 },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="MapStack"
        component={MapStackNavigator}
        options={{ tabBarLabel: 'Explorer', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧭</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
