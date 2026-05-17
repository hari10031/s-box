import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import colors from '../theme/colors';
import { borderRadius } from '../theme/spacing';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.info}>
        <View style={styles.titleLine} />
        <View style={styles.priceLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: colors.card, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: 16 },
  image: { width: '100%', height: CARD_WIDTH * 1.3, backgroundColor: colors.surfaceLight },
  info: { padding: 10 },
  titleLine: { width: '80%', height: 14, backgroundColor: colors.surfaceLight, borderRadius: 4, marginBottom: 8 },
  priceLine: { width: '50%', height: 14, backgroundColor: colors.surfaceLight, borderRadius: 4 },
});
