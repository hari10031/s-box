import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { borderRadius } from '../theme/spacing';

const statusColors = {
  pending: { bg: 'rgba(244,162,51,0.15)', text: colors.pending },
  approved: { bg: 'rgba(45,198,83,0.15)', text: colors.approved },
  rejected: { bg: 'rgba(230,57,70,0.15)', text: colors.rejected },
  active: { bg: 'rgba(45,198,83,0.15)', text: colors.approved },
  banned: { bg: 'rgba(230,57,70,0.15)', text: colors.rejected },
  available: { bg: 'rgba(76,201,240,0.15)', text: colors.info },
  sold: { bg: 'rgba(244,162,51,0.15)', text: colors.warning },
};

export default function StatusBadge({ status, style }) {
  const scheme = statusColors[status] || statusColors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: scheme.bg }, style]}>
      <Text style={[styles.text, { color: scheme.text }]}>{status?.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.round, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
});
