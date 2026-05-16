import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import StatusBadge from '../../components/StatusBadge';
import { getSales } from '../../api/sales';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function MySalesScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSales = useCallback(async () => {
    try { const { data } = await getSales(); setSales(data.data); }
    catch (err) { console.error(err); }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { fetchSales(); }, []);

  const renderSale = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.sareeName}>{item.sareeRef?.name || 'Unknown'}</Text>
          <Text style={styles.customer}>Customer: {item.customerRef?.name || 'N/A'}</Text>
          <Text style={styles.price}>₹{item.salePrice?.toLocaleString()}</Text>
          <Text style={styles.date}>{new Date(item.saleDate).toLocaleDateString()}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      {item.status === 'rejected' && item.rejectionReason ? (
        <Text style={styles.reason}>Reason: {item.rejectionReason}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sales</Text>
      <FlatList data={sales} keyExtractor={i => i._id} renderItem={renderSale} contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSales(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : 'No sales yet'}</Text>} />
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
  customer: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  price: { color: colors.secondary, fontSize: 18, fontWeight: '700', marginTop: 4 },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  reason: { color: colors.error, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
