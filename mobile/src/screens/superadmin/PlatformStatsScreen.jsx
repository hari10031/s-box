import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformStats } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function PlatformStatsScreen() {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await getPlatformStats();
      setStats(data);
    } catch (err) { console.error(err); }
    setRefreshing(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = [
    { icon: 'people', label: 'Total Admins', key: 'totalAdmins', color: colors.primary, bg: colors.primary + '18' },
    { icon: 'shirt', label: 'Total Sarees', key: 'totalSarees', color: colors.secondary, bg: colors.secondary + '18' },
    { icon: 'cart', label: 'Total Sales', key: 'totalSales', color: colors.accent, bg: colors.accent + '18' },
    { icon: 'person', label: 'Active Employees', key: 'totalEmployees', color: colors.info, bg: colors.info + '18' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Platform Overview</Text>
        <Text style={styles.subtitle}>Real-time platform statistics</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchStats(); }}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.grid}>
          {statCards.map((card) => (
            <View key={card.key} style={styles.statCard}>
              <View style={[styles.iconBox, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={24} color={card.color} />
              </View>
              <Text style={styles.statValue}>{stats?.[card.key] ?? '—'}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        {stats && (
          <View style={styles.summaryCard}>
            <Ionicons name="analytics-outline" size={20} color={colors.secondary} />
            <Text style={styles.summaryText}>
              Your platform has {stats.totalAdmins || 0} admin stores managing{' '}
              {stats.totalSarees || 0} sarees with {stats.totalEmployees || 0} active employees.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingRight: 64,
    paddingTop: 56,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  scrollContent: { padding: 16, paddingTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  statValue: { color: colors.text, fontSize: 30, fontWeight: '700' },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
});
