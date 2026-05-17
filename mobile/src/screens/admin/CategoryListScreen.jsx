import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { getCategories, createCategory } from '../../api/categories';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

const PRICE_TIERS = [
  { label: 'None', value: '' },
  { label: 'Budget', value: 'budget' },
  { label: 'Mid-Range', value: 'mid' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' },
];

export default function CategoryListScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', fabric: '', occasion: '', region: '', priceTier: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const update = (k, v) => setForm({ ...form, [k]: v });

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await getCategories();
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchCategories());
    return unsubscribe;
  }, [navigation, fetchCategories]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError('Category name is required');
      return;
    }
    setError('');
    setCreating(true);
    try {
      await createCategory(form);
      setShowModal(false);
      setForm({ name: '', fabric: '', occasion: '', region: '', priceTier: '' });
      fetchCategories();
      Alert.alert('✅ Success', 'Category created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
    }
    setCreating(false);
  };

  const getTagColor = (tier) => {
    const map = { budget: colors.success, mid: colors.info, premium: colors.warning, luxury: colors.secondary };
    return map[tier] || colors.textMuted;
  };

  const renderCategory = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: getCatColor(index) + '20' }]}>
          <Ionicons name="pricetags" size={20} color={getCatColor(index)} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.catName}>{item.name}</Text>
          <Text style={styles.catSlug}>{item.slug}</Text>
        </View>
        {item.priceTier ? (
          <View style={[styles.tierBadge, { backgroundColor: getTagColor(item.priceTier) + '20' }]}>
            <Text style={[styles.tierText, { color: getTagColor(item.priceTier) }]}>
              {item.priceTier.toUpperCase()}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Details */}
      <View style={styles.detailsRow}>
        {item.fabric ? (
          <View style={styles.detailChip}>
            <Ionicons name="leaf-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.detailChipText}>{item.fabric}</Text>
          </View>
        ) : null}
        {item.occasion ? (
          <View style={styles.detailChip}>
            <Ionicons name="sparkles-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.detailChipText}>{item.occasion}</Text>
          </View>
        ) : null}
        {item.region ? (
          <View style={styles.detailChip}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.detailChipText}>{item.region}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>{categories.length} categories</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)} activeOpacity={0.7}>
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategories(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={48} color={colors.textMuted} />
            <Text style={styles.empty}>{loading ? 'Loading...' : 'No categories yet'}</Text>
            {!loading && <Text style={styles.emptyHint}>Tap + to create your first category</Text>}
          </View>
        }
      />

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setError(''); }} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <FormInput
              label="Category Name *"
              value={form.name}
              onChangeText={(v) => update('name', v)}
              placeholder="e.g., Kanjivaram Silk"
            />
            <FormInput
              label="Fabric"
              value={form.fabric}
              onChangeText={(v) => update('fabric', v)}
              placeholder="e.g., Silk, Cotton, Chiffon"
            />
            <FormInput
              label="Occasion"
              value={form.occasion}
              onChangeText={(v) => update('occasion', v)}
              placeholder="e.g., Wedding, Casual, Festive"
            />
            <FormInput
              label="Region"
              value={form.region}
              onChangeText={(v) => update('region', v)}
              placeholder="e.g., Tamil Nadu, Varanasi"
            />

            {/* Price Tier Selector */}
            <Text style={styles.fieldLabel}>PRICE TIER</Text>
            <View style={styles.tierRow}>
              {PRICE_TIERS.map((tier) => (
                <TouchableOpacity
                  key={tier.value}
                  style={[styles.tierOption, form.priceTier === tier.value && styles.tierOptionActive]}
                  onPress={() => update('priceTier', tier.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tierOptionText, form.priceTier === tier.value && styles.tierOptionTextActive]}>
                    {tier.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Create Category"
              onPress={handleCreate}
              loading={creating}
              icon={!creating && <Ionicons name="pricetag" size={16} color={colors.white} />}
              style={{ marginTop: 16 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const catColors = [colors.primary, colors.accent, colors.secondary, colors.info, '#7C3AED', colors.warning];
const getCatColor = (index) => catColors[index % catColors.length];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingRight: 64,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  addBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  list: { padding: 16, paddingTop: 4 },
  card: {
    backgroundColor: colors.card, borderRadius: borderRadius.xl,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  catName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  catSlug: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.round },
  tierText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  detailChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: borderRadius.round,
  },
  detailChipText: { color: colors.textSecondary, fontSize: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  empty: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
  emptyHint: { color: colors.textMuted, fontSize: 12, opacity: 0.7 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(230,57,70,0.12)', padding: 12, borderRadius: borderRadius.md,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(230,57,70,0.25)',
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },
  fieldLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  tierRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border,
  },
  tierOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tierOptionText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  tierOptionTextActive: { color: colors.white },
});
