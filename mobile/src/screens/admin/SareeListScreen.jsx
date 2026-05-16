import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SareeCard from '../../components/SareeCard';
import SkeletonCard from '../../components/SkeletonCard';
import { deleteSaree, getSarees } from '../../api/sarees';
import colors from '../../theme/colors';

export default function SareeListScreen({ navigation }) {
  const [sarees, setSarees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSarees = useCallback(async (p = 1, refresh = false) => {
    try {
      const { data } = await getSarees({ page: p, limit: 50 });
      setSarees(refresh ? data.data : [...sarees, ...data.data]);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch (err) { console.error(err); }
    setLoading(false);
    setRefreshing(false);
  }, [sarees]);

  useEffect(() => { fetchSarees(); }, []);

  const handleDelete = (item) => {
    Alert.alert(
      'Delete Saree',
      `Delete "${item.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(item._id);
              await deleteSaree(item._id);
              setSarees((prev) => prev.filter((s) => s._id !== item._id));
            } catch (err) {
              Alert.alert('Failed', err.response?.data?.error || 'Failed to delete saree');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sarees</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.catBtn} onPress={() => navigation.navigate('Categories')} activeOpacity={0.7}>
            <Ionicons name="pricetags-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddEditSaree')} activeOpacity={0.7}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={loading ? [1, 2, 3, 4] : sarees}
        keyExtractor={(item, i) => item._id || String(i)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) =>
          loading ? <SkeletonCard /> : (
            <View style={styles.cardWrap}>
              <SareeCard saree={item} onPress={() => navigation.navigate('SareeDetail', { id: item._id })} />
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('AddEditSaree', { saree: item })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={15} color={colors.primary} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                  disabled={deletingId === item._id}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={15} color={colors.error} />
                  <Text style={styles.deleteText}>{deletingId === item._id ? 'Deleting...' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSarees(1, true); }} tintColor={colors.primary} />}
        onEndReached={() => { if (page < totalPages) fetchSarees(page + 1); }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={!loading && <Text style={styles.empty}>No sarees added yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingRight: 64, paddingTop: 60, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, flex: 1 },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  addBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  row: { justifyContent: 'space-between' },
  cardWrap: { width: '48%', marginBottom: 16 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: -6 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.primary, borderRadius: 10, paddingVertical: 7, backgroundColor: colors.primary + '12',
  },
  deleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.error, borderRadius: 10, paddingVertical: 7, backgroundColor: colors.error + '12',
  },
  editText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  deleteText: { color: colors.error, fontSize: 12, fontWeight: '600' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
