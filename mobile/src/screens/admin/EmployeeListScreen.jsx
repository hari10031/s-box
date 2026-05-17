import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { getEmployees, approveEmployee, createEmployee } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function EmployeeListScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('active'); // active | pending

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await getEmployees({ status: tab });
      setEmployees(data.data);
    } catch (err) { console.error(err); }
    setLoading(false); setRefreshing(false);
  }, [tab]);

  useEffect(() => { setLoading(true); fetchEmployees(); }, [tab]);

  const handleApprove = async (id, approve) => {
    try {
      await approveEmployee(id, approve);
      fetchEmployees();
    } catch (err) { Alert.alert('Error', err.response?.data?.error || 'Failed'); }
  };

  const renderEmployee = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(item._id, true)}>
            <Ionicons name="checkmark" size={16} color={colors.white} />
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleApprove(item._id, false)}>
            <Ionicons name="close" size={16} color={colors.white} />
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employees</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateEmployee')}>
          <Ionicons name="person-add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {['active', 'pending'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={employees} keyExtractor={(item) => item._id} renderItem={renderEmployee}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEmployees(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : `No ${tab} employees`}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingRight: 64, paddingTop: 60, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: borderRadius.round, backgroundColor: colors.surfaceLight },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  activeTabText: { color: colors.white },
  list: { padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  username: { color: colors.textMuted, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: borderRadius.sm },
  approveBtn: { backgroundColor: colors.success },
  rejectBtn: { backgroundColor: colors.error },
  actionText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
