import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { getSareeDetail } from '../../api/sarees';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export default function SareeDetailScreen({ route }) {
  const { id } = route.params;
  const [saree, setSaree] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getSareeDetail(id).then(r => setSaree(r.data)).catch(console.error);
  }, [id]);

  if (!saree) return <View style={styles.container}><Text style={styles.loading}>Loading...</Text></View>;

  const images = saree.imageUrls || [];
  const discounted = saree.discount > 0 ? saree.price - (saree.price * saree.discount / 100) : null;

  return (
    <ScrollView style={styles.container}>
      {images.length > 0 ? (
        <View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img.detail }} style={styles.image} contentFit="cover" transition={300} />
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {images.map((_, i) => <View key={i} style={[styles.dot, activeImg === i && styles.activeDot]} />)}
          </View>
        </View>
      ) : (
        <View style={styles.noImage}><Text style={styles.noImageText}>No Images</Text></View>
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{saree.name}</Text>
          <StatusBadge status={saree.stockStatus} />
        </View>

        <View style={styles.priceRow}>
          {discounted ? (
            <>
              <Text style={styles.price}>₹{Math.round(discounted).toLocaleString()}</Text>
              <Text style={styles.originalPrice}>₹{saree.price.toLocaleString()}</Text>
              <View style={styles.discountBadge}><Text style={styles.discountText}>{saree.discount}% OFF</Text></View>
            </>
          ) : (
            <Text style={styles.price}>₹{saree.price.toLocaleString()}</Text>
          )}
        </View>

        {saree.category && (
          <View style={styles.category}>
            <Text style={styles.categoryText}>{saree.category.name}</Text>
          </View>
        )}

        {saree.tags?.length > 0 && (
          <View style={styles.tags}>
            {saree.tags.map((tag, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
            ))}
          </View>
        )}

        {saree.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{saree.description}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { color: colors.textMuted, textAlign: 'center', marginTop: 100 },
  image: { width, height: width * 1.2 },
  noImage: { width, height: 300, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  noImageText: { color: colors.textMuted },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: -24, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  activeDot: { backgroundColor: colors.white, width: 20 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 24, fontWeight: '700', color: colors.text, flex: 1, marginRight: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  price: { fontSize: 28, fontWeight: '700', color: colors.secondary },
  originalPrice: { fontSize: 18, color: colors.textMuted, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: colors.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
  discountText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  category: { backgroundColor: colors.surfaceLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.round, alignSelf: 'flex-start', marginBottom: 12 },
  categoryText: { color: colors.textSecondary, fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: { backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: borderRadius.round, borderWidth: 1, borderColor: colors.border },
  tagText: { color: colors.textSecondary, fontSize: 12 },
  section: { marginTop: 8 },
  sectionTitle: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  description: { color: colors.text, fontSize: 15, lineHeight: 24 },
});
