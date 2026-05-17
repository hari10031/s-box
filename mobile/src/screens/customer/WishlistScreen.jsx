import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export default function WishlistScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>♡</Text>
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
        <Text style={styles.emptySub}>Save your favourite sarees here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, paddingHorizontal: 20, paddingRight: 64, marginBottom: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  emptyIcon: { fontSize: 48, color: colors.textMuted, marginBottom: 16 },
  emptyText: { color: colors.text, fontSize: 18, fontWeight: '600' },
  emptySub: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
});
