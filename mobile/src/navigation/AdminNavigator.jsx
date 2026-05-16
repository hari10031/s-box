import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/admin/DashboardScreen';
import SareeListScreen from '../screens/admin/SareeListScreen';
import AddEditSareeScreen from '../screens/admin/AddEditSareeScreen';
import CategoryListScreen from '../screens/admin/CategoryListScreen';
import EmployeeListScreen from '../screens/admin/EmployeeListScreen';
import CreateEmployeeScreen from '../screens/admin/CreateEmployeeScreen';
import SaleApprovalsScreen from '../screens/admin/SaleApprovalsScreen';
import CustomerListScreen from '../screens/admin/CustomerListScreen';
import CreateCustomerScreen from '../screens/admin/CreateCustomerScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import SareeDetailScreen from '../screens/customer/SareeDetailScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOpts = { headerShown: false, contentStyle: { backgroundColor: colors.background } };

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="SaleApprovals" component={SaleApprovalsScreen} />
      <Stack.Screen name="Notifications" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

function SareesStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="SareeList" component={SareeListScreen} />
      <Stack.Screen name="AddEditSaree" component={AddEditSareeScreen} />
      <Stack.Screen name="SareeDetail" component={SareeDetailScreen} />
      <Stack.Screen name="Categories" component={CategoryListScreen} />
    </Stack.Navigator>
  );
}

function EmployeesStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
      <Stack.Screen name="CreateEmployee" component={CreateEmployeeScreen} />
    </Stack.Navigator>
  );
}

function CustomersStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} />
      <Stack.Screen name="CreateCustomer" component={CreateCustomerScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 65, paddingBottom: 8 },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarIcon: ({ color, size }) => {
        const icons = { Dashboard: 'grid', Sarees: 'shirt', Team: 'people', Customers: 'person', Analytics: 'bar-chart' };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Sarees" component={SareesStack} />
      <Tab.Screen name="Team" component={EmployeesStack} />
      <Tab.Screen name="Customers" component={CustomersStack} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}
