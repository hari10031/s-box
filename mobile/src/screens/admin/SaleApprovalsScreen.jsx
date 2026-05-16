import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { getSales, approveSale, rejectSale } from '../../api/sales';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function SaleApprovalsScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [reason, setReason] = useState('');

  const fetchSales = useCallback(async () => {
    try {
      const { data } = await getSales({ status: 'pending' });
      setSales(data.data);
    } catch (err) { console.error(err); }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { fetchSales(); }, []);

  const handleApprove = async (id) => {
    try { await approveSale(id); fetchSales(); } catch (err) { Alert.alert('Error', err.response?.data?.error || 'Failed'); }
  };

  const handleReject = async (id) => {
    try { await rejectSale(id, reason); setRejectId(null); setReason(''); fetchSales(); } catch (err) { Alert.alert('Error', err.response?.data?.error || 'Failed'); }
  };

  const renderSale = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.sareeName}>{item.sareeRef?.name || 'Unknown Saree'}</Text>
          <Text style={styles.meta}>By: {item.employeeRef?.name} → {item.customerRef?.name}</Text>
          <Text style={styles.price}>₹{item.salePrice?.toLocaleString()}</Text>
          <Text style={styles.date}>{new Date(item.saleDate).toLocaleDateString()}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      {item.note ? <Text style={styles.note}>Note: {item.note}</Text> : null}
      {rejectId === item._id ? (
        <View style={styles.rejectBox}>
          <TextInput style={styles.rejectInput} value={reason} onChangeText={setReason} placeholder="Rejection reason..." placeholderTextColor={colors.textMuted} />
          <View style={styles.rejectActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setRejectId(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.confirmRejectBtn} onPress={() => handleReject(item._id)}><Text style={styles.actionText}>Confirm</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApprove(item._id)}>
            <Ionicons name="checkmark" size={16} color={colors.white} /><Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => setRejectId(item._id)}>
            <Ionicons name="close" size={16} color={colors.white} /><Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Approvals</Text>
      <FlatList data={sales} keyExtractor={i => i._id} renderItem={renderSale} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSales(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : 'No pending sales'}</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, paddingHorizontal: 20, paddingRight: 64, marginBottom: 16 },
  list: { padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  sareeName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  price: { color: colors.secondary, fontSize: 18, fontWeight: '700', marginTop: 4 },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  note: { color: colors.textMuted, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: borderRadius.sm },
  approveBtn: { backgroundColor: colors.success },
  rejectBtn: { backgroundColor: colors.error },
  actionText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  rejectBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  rejectInput: { backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: borderRadius.sm, padding: 12, fontSize: 14, marginBottom: 8 },
  rejectActions: { flexDirection: 'row', gap: 8 },
  cancelBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.sm, backgroundColor: colors.surfaceLight },
  cancelText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  confirmRejectBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.sm, backgroundColor: colors.error },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
