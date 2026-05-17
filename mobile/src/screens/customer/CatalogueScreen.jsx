import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import SareeCard from '../../components/SareeCard';
import SkeletonCard from '../../components/SkeletonCard';
import useSareeStore from '../../store/sareeStore';
import colors from '../../theme/colors';

export default function CatalogueScreen({ navigation }) {
  const { sarees, hasMore, isLoading, isRefreshing, fetchSarees } = useSareeStore();

  useEffect(() => { fetchSarees({}, true); }, []);

  const loadMore = () => { if (hasMore && !isLoading) fetchSarees(); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>✦ SAREES</Text>
        <Text style={styles.subtitle}>Explore our collection</Text>
      </View>
      <FlatList
        data={isLoading && sarees.length === 0 ? [1, 2, 3, 4] : sarees}
        keyExtractor={(item, i) => item._id || String(i)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) =>
          typeof item === 'number' ? <SkeletonCard /> :
          <SareeCard saree={item} onPress={() => navigation.navigate('SareeDetail', { id: item._id })} />
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchSarees({}, true)} tintColor={colors.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={!isLoading && <Text style={styles.empty}>No sarees available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingRight: 64, paddingTop: 60, paddingBottom: 16 },
  brand: { fontSize: 28, fontWeight: '800', color: colors.secondary, letterSpacing: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  list: { padding: 16 },
  row: { justifyContent: 'space-between' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
