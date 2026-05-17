import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { getSalesAnalytics } from '../../api/analytics';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function AnalyticsScreen() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try { const res = await getSalesAnalytics({ period: '30d' }); setData(res.data); }
    catch (err) { console.error(err); }
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Sarees</Text>
          {data?.topSarees?.map((s, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.rank}><Text style={styles.rankText}>#{i + 1}</Text></View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{s.name}</Text>
                <Text style={styles.rowMeta}>{s.count} sales</Text>
              </View>
              <Text style={styles.rowRevenue}>₹{s.revenue?.toLocaleString()}</Text>
            </View>
          )) || <Text style={styles.empty}>No data yet</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue by Employee</Text>
          {data?.revenueByEmployee?.map((e, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.rank, { backgroundColor: colors.accent + '20' }]}><Text style={[styles.rankText, { color: colors.accent }]}>#{i + 1}</Text></View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{e.name}</Text>
                <Text style={styles.rowMeta}>{e.count} sales</Text>
              </View>
              <Text style={styles.rowRevenue}>₹{e.revenue?.toLocaleString()}</Text>
            </View>
          )) || <Text style={styles.empty}>No data yet</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales Over Time (30 days)</Text>
          {data?.salesOverTime?.length > 0 ? data.salesOverTime.slice(-10).map((d, i) => (
            <View key={i} style={styles.timeRow}>
              <Text style={styles.timeDate}>{d._id}</Text>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${Math.min((d.revenue / Math.max(...data.salesOverTime.map(x => x.revenue))) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.timeRev}>₹{d.revenue?.toLocaleString()}</Text>
            </View>
          )) : <Text style={styles.empty}>No sales data yet</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, paddingHorizontal: 20, paddingRight: 64, marginBottom: 16 },
  section: { backgroundColor: colors.card, borderRadius: borderRadius.lg, margin: 16, marginTop: 0, padding: 16, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  rank: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  rankText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  rowInfo: { flex: 1 },
  rowName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  rowMeta: { color: colors.textMuted, fontSize: 12 },
  rowRevenue: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  timeDate: { color: colors.textMuted, fontSize: 11, width: 55 },
  bar: { flex: 1, height: 12, backgroundColor: colors.surfaceLight, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  timeRev: { color: colors.textSecondary, fontSize: 11, width: 65, textAlign: 'right' },
  empty: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 20 },
});
