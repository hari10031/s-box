import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDashboard } from '../../api/analytics';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try { const { data } = await getDashboard(); setStats(data); } catch (err) { console.error(err); }
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchDashboard(); }, []);

  const MetricCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={styles.metric} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.metricValue}>{value ?? '-'}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(); }} tintColor={colors.primary} />}>
        {stats?.pendingSales > 0 && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate('SaleApprovals')}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.alertText}>{stats.pendingSales} pending sale{stats.pendingSales > 1 ? 's' : ''} awaiting approval</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.warning} />
          </TouchableOpacity>
        )}

        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>₹{(stats?.totalRevenue || 0).toLocaleString()}</Text>
          <Text style={styles.revenueSub}>{stats?.approvedSales || 0} approved sales</Text>
        </View>

        <View style={styles.grid}>
          <MetricCard icon="shirt" label="Total Sarees" value={stats?.totalSarees} color={colors.secondary} />
          <MetricCard icon="checkmark-circle" label="Available" value={stats?.availableSarees} color={colors.success} />
          <MetricCard icon="bag-check" label="Sold" value={stats?.soldSarees} color={colors.warning} />
          <MetricCard icon="time" label="Pending Sales" value={stats?.pendingSales} color={colors.pending} onPress={() => navigation.navigate('SaleApprovals')} />
          <MetricCard icon="people" label="Employees" value={stats?.activeEmployees} color={colors.info} />
          <MetricCard icon="person" label="Customers" value={stats?.totalCustomers} color={colors.accent} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingRight: 64, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(244,162,51,0.12)', padding: 14, borderRadius: borderRadius.md, borderWidth: 1, borderColor: 'rgba(244,162,51,0.3)' },
  alertText: { flex: 1, color: colors.warning, fontSize: 14, fontWeight: '500' },
  revenueCard: { marginHorizontal: 16, marginBottom: 16, padding: 24, borderRadius: borderRadius.xl, backgroundColor: colors.primary, alignItems: 'center' },
  revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  revenueValue: { color: colors.white, fontSize: 36, fontWeight: '700', marginVertical: 4 },
  revenueSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  metric: { width: '31%', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  metricIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  metricValue: { color: colors.text, fontSize: 22, fontWeight: '700' },
  metricLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
});
