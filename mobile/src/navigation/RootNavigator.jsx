import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/authStore';
import LoginScreen from '../screens/auth/LoginScreen';
import EmployeeRegisterScreen from '../screens/auth/EmployeeRegisterScreen';
import SuperAdminNavigator from './SuperAdminNavigator';
import AdminNavigator from './AdminNavigator';
import EmployeeNavigator from './EmployeeNavigator';
import CustomerNavigator from './CustomerNavigator';
import colors from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

function getRoleNavigator(role) {
  switch (role) {
    case 'super_admin': return SuperAdminNavigator;
    case 'admin': return AdminNavigator;
    case 'employee': return EmployeeNavigator;
    case 'customer': return CustomerNavigator;
    default: return LoginScreen;
  }
}

function MainApp() {
  const { user, logout } = useAuthStore();
  const RoleNavigator = getRoleNavigator(user?.role);

  return (
    <View style={{ flex: 1 }}>
      <RoleNavigator />
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

  useEffect(() => { restoreSession(); }, []);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainApp} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="EmployeeRegister" component={EmployeeRegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  logoutBtn: { position: 'absolute', top: 52, right: 20, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(230,57,70,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
});
