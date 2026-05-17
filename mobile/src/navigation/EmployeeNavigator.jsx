import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MySalesScreen from '../screens/employee/MySalesScreen';
import LogSaleScreen from '../screens/employee/LogSaleScreen';
import CustomerListScreen from '../screens/admin/CustomerListScreen';
import CreateCustomerScreen from '../screens/admin/CreateCustomerScreen';
import SareeListScreen from '../screens/admin/SareeListScreen';
import AddEditSareeScreen from '../screens/admin/AddEditSareeScreen';
import CategoryListScreen from '../screens/admin/CategoryListScreen';
import SareeDetailScreen from '../screens/customer/SareeDetailScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOpts = { headerShown: false, contentStyle: { backgroundColor: colors.background } };

function SalesStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="MySales" component={MySalesScreen} />
      <Stack.Screen name="LogSale" component={LogSaleScreen} />
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

export default function EmployeeNavigator() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 65, paddingBottom: 8 },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarIcon: ({ color, size }) => {
        const icons = { Sales: 'receipt', Sarees: 'shirt', 'New Sale': 'add-circle', Customers: 'person' };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Sales" component={SalesStack} />
      <Tab.Screen name="Sarees" component={SareesStack} />
      <Tab.Screen name="New Sale" component={LogSaleScreen} />
      <Tab.Screen name="Customers" component={CustomersStack} />
    </Tab.Navigator>
  );
}
