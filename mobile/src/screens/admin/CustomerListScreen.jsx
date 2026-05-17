import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCustomers } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function CustomerListScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try { const { data } = await getCustomers(); setCustomers(data.data); }
    catch (err) { console.error(err); }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, []);

  const renderCustomer = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      {item.contact ? <Text style={styles.contact}>{item.contact}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateCustomer')}>
          <Ionicons name="person-add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      <FlatList data={customers} keyExtractor={i => i._id} renderItem={renderCustomer} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCustomers(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : 'No customers yet'}</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingRight: 64, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  username: { color: colors.textMuted, fontSize: 12 },
  contact: { color: colors.textSecondary, fontSize: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
