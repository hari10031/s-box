import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import colors from '../theme/colors';
import { borderRadius } from '../theme/spacing';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SareeCard({ saree, onPress }) {
  const imageUrl = saree.coverImage?.list || saree.coverImage?.thumbnail;
  const discountedPrice = saree.discount > 0
    ? saree.price - (saree.price * saree.discount / 100)
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={300} placeholder={{ blurhash: 'L6Pj0^jE.mfR_3fR~qj[Ioax' }} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        {saree.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{saree.discount}% OFF</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{saree.name}</Text>
        <View style={styles.priceRow}>
          {discountedPrice ? (
            <>
              <Text style={styles.price}>₹{Math.round(discountedPrice).toLocaleString()}</Text>
              <Text style={styles.originalPrice}>₹{saree.price.toLocaleString()}</Text>
            </>
          ) : (
            <Text style={styles.price}>₹{saree.price.toLocaleString()}</Text>
          )}
        </View>
        {saree.category?.name && (
          <Text style={styles.category}>{saree.category.name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: colors.card, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: 16 },
  imageContainer: { width: '100%', height: CARD_WIDTH * 1.3, position: 'relative' },
  image: { width: '100%', height: '100%' },
  placeholder: { width: '100%', height: '100%', backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.textMuted, fontSize: 12 },
  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
  discountText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  info: { padding: 10 },
  name: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  originalPrice: { color: colors.textMuted, fontSize: 12, textDecorationLine: 'line-through' },
  category: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
});
