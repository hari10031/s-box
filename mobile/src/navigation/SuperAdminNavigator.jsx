import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AdminListScreen from '../screens/superadmin/AdminListScreen';
import CreateAdminScreen from '../screens/superadmin/CreateAdminScreen';
import AdminDetailScreen from '../screens/superadmin/AdminDetailScreen';
import PlatformStatsScreen from '../screens/superadmin/PlatformStatsScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="AdminList" component={AdminListScreen} />
      <Stack.Screen name="CreateAdmin" component={CreateAdminScreen} />
      <Stack.Screen name="AdminDetail" component={AdminDetailScreen} />
    </Stack.Navigator>
  );
}

export default function SuperAdminNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 65, paddingBottom: 8 },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarIcon: ({ color, size }) => {
        const icons = { Admins: 'people', Stats: 'bar-chart' };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Admins" component={AdminsStack} />
      <Tab.Screen name="Stats" component={PlatformStatsScreen} />
    </Tab.Navigator>
  );
}
