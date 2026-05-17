import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image,
  Modal, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import ZoomableImageModal from '../../components/ZoomableImageModal';
import { createSaree, generateSareeImage, updateSaree } from '../../api/sarees';
import { getCategories } from '../../api/categories';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

const getGeneratedImageUrl = (saree) =>
  saree?.imageUrls?.[0]?.detail || saree?.coverImage?.detail || saree?.coverImage?.list || null;

const getImageUploadPart = (img, index) => {
  const uri = img.uri;
  const uriExtension = uri?.split('?')[0]?.split('.').pop()?.toLowerCase();
  const safeExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(uriExtension) ? uriExtension : 'jpg';
  const type = img.mimeType || (safeExtension === 'png' ? 'image/png' : safeExtension === 'webp' ? 'image/webp' : 'image/jpeg');

  return {
    uri,
    name: img.fileName || `reference_${index}.${safeExtension}`,
    type,
  };
};

export default function AddEditSareeScreen({ navigation, route }) {
  const editingSaree = route?.params?.saree;
  const isEdit = !!editingSaree?._id;
  const [form, setForm] = useState({ name: '', description: '', price: '', discount: '0', tags: '', aiPrompt: '', garmentType: 'saree' });
  const [images, setImages] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedImageIsNew, setGeneratedImageIsNew] = useState(false);
  const [showGeneratedPreview, setShowGeneratedPreview] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const update = (k, v) => setForm({ ...form, [k]: v });

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setForm({
      name: editingSaree.name || '',
      description: editingSaree.description || '',
      price: editingSaree.price != null ? String(editingSaree.price) : '',
      discount: editingSaree.discount != null ? String(editingSaree.discount) : '0',
      tags: Array.isArray(editingSaree.tags) ? editingSaree.tags.join(', ') : '',
      aiPrompt: '',
      garmentType: editingSaree.garmentType || 'saree',
    });
    if (editingSaree.category?._id) setSelectedCategory(editingSaree.category);
    if (editingSaree.images?.[0]) {
      setGeneratedImage({
        publicId: editingSaree.images[0],
        imageUrl: getGeneratedImageUrl(editingSaree),
      });
      setGeneratedImageIsNew(false);
    }
  }, [isEdit, editingSaree]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets].slice(0, 8));
      setGeneratedImage(null);
      setGeneratedImageIsNew(false);
    }
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
    setGeneratedImage(null);
    setGeneratedImageIsNew(false);
  };

  const handleGenerateImage = async () => {
    if (images.length === 0) { setError('Add at least one reference image'); return; }
    setError('');
    setGeneratingImage(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('garmentType', form.garmentType);
      if (form.tags) formData.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim())));
      if (form.aiPrompt?.trim()) formData.append('aiPrompt', form.aiPrompt.trim());
      if (generatedImage?.publicId) formData.append('previousGeneratedImagePublicId', generatedImage.publicId);
      images.forEach((img, i) => {
        formData.append('references', getImageUploadPart(img, i));
      });

      const { data } = await generateSareeImage(formData);
      setGeneratedImage({ publicId: data.publicId, imageUrl: data.imageUrl });
      setGeneratedImageIsNew(true);
      setShowGeneratedPreview(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate AI image');
    }
    setGeneratingImage(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    if (!isEdit && !generatedImage?.publicId) { setError('Generate AI image before creating saree'); return; }
    if (images.length > 0 && !generatedImage?.publicId) { setError('Generate AI image before saving changes'); return; }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('discount', form.discount || '0');
      formData.append('garmentType', form.garmentType);
      if (selectedCategory) formData.append('category', selectedCategory._id);
      if (form.tags) formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim())));
      if (generatedImage?.publicId && (!isEdit || generatedImageIsNew)) {
        formData.append('generatedImagePublicId', generatedImage.publicId);
      }
      if (isEdit) {
        await updateSaree(editingSaree._id, formData);
        Alert.alert('✅ Success', 'Saree updated successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await createSaree(formData);
        Alert.alert('✅ Success', 'Saree created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || (isEdit ? 'Failed to update saree' : 'Failed to create saree'));
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{isEdit ? 'Edit Saree' : 'Add Saree'}</Text>
              <Text style={styles.subtitle}>{isEdit ? 'Update saree details and image' : 'Add a new saree to your store'}</Text>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Images */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.info + '20' }]}>
                <Ionicons name="images" size={16} color={colors.info} />
              </View>
              <Text style={styles.sectionTitle}>Reference Images ({images.length}/8)</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={styles.addImage} onPress={pickImages} activeOpacity={0.7}>
                <Ionicons name="camera" size={28} color={colors.textMuted} />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
              {images.map((img, i) => (
                <View key={i} style={styles.imageThumb}>
                  <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                  <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(i)}>
                    <Ionicons name="close-circle" size={22} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <Button
              title={generatingImage ? 'Generating AI Image...' : 'Generate AI Image'}
              variant="outline"
              loading={generatingImage}
              disabled={loading || images.length === 0}
              onPress={handleGenerateImage}
              icon={!generatingImage && <Ionicons name="sparkles-outline" size={16} color={colors.primary} />}
              style={{ marginTop: 12 }}
            />

            {generatedImage?.imageUrl ? (
              <View style={styles.generatedWrap}>
                <Text style={styles.generatedLabel}>Generated Image (saved to Cloudinary)</Text>
                <TouchableOpacity
                  style={styles.generatedPreviewButton}
                  onPress={() => setShowGeneratedPreview(true)}
                  activeOpacity={0.86}
                >
                  <Image source={{ uri: generatedImage.imageUrl }} style={styles.generatedImage} resizeMode="contain" />
                  <View style={styles.zoomOverlay}>
                    <Ionicons name="expand-outline" size={16} color={colors.white} />
                    <Text style={styles.zoomOverlayText}>Open full screen</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.previewHint}>Tap image to zoom and inspect details</Text>
              </View>
            ) : generatedImage?.publicId ? (
              <View style={styles.generatedWrap}>
                <Text style={styles.generatedLabel}>Generated image selected (Cloudinary)</Text>
              </View>
            ) : null}
          </View>

          {/* Details */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="shirt" size={16} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Details</Text>
            </View>

            {/* Garment Type Selector */}
            <Text style={styles.fieldLabel}>GARMENT TYPE</Text>
            <View style={styles.garmentTypeRow}>
              {['saree', 'dress'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.garmentTypeBtn,
                    form.garmentType === type && styles.garmentTypeBtnActive,
                  ]}
                  onPress={() => update('garmentType', type)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={form.garmentType === type ? 'checkmark-circle' : 'ellipse-outline'}
                    size={18}
                    color={form.garmentType === type ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.garmentTypeText,
                      form.garmentType === type && styles.garmentTypeTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <FormInput label="Name *" value={form.name} onChangeText={(v) => update('name', v)} placeholder="Saree/Dress name" />
            <FormInput label="Description" value={form.description} onChangeText={(v) => update('description', v)} placeholder="Describe the item" multiline numberOfLines={3} />

            {/* Category Picker */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <TouchableOpacity style={styles.categoryPicker} onPress={() => setShowCatPicker(true)} activeOpacity={0.7}>
              {selectedCategory ? (
                <View style={styles.selectedCat}>
                  <Ionicons name="pricetag" size={16} color={colors.primary} />
                  <Text style={styles.selectedCatText}>{selectedCategory.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.clearCat} activeOpacity={0.7}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.placeholderRow}>
                  <Ionicons name="pricetags-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.placeholderText}>Select a category</Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                </View>
              )}
            </TouchableOpacity>

            {/* Link to manage categories */}
            <TouchableOpacity
              style={styles.manageCatLink}
              onPress={() => navigation.navigate('Categories')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={14} color={colors.primary} />
              <Text style={styles.manageCatText}>Manage Categories</Text>
            </TouchableOpacity>
          </View>

          {/* Pricing */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="cash" size={16} color={colors.secondary} />
              </View>
              <Text style={styles.sectionTitle}>Pricing</Text>
            </View>
            <FormInput label="Price (₹) *" value={form.price} onChangeText={(v) => update('price', v)} placeholder="2500" keyboardType="numeric" />
            <FormInput label="Discount (%)" value={form.discount} onChangeText={(v) => update('discount', v)} placeholder="0" keyboardType="numeric" />
            <FormInput label="Tags (comma separated)" value={form.tags} onChangeText={(v) => update('tags', v)} placeholder="Silk, Bridal, Kanjivaram" style={{ marginBottom: 0 }} />
            <FormInput
              label="AI Image Prompt (optional)"
              value={form.aiPrompt}
              onChangeText={(v) => update('aiPrompt', v)}
              placeholder="Luxury editorial style, soft warm light..."
              multiline
              numberOfLines={2}
              style={{ marginTop: 12, marginBottom: 0 }}
            />
          </View>

          {/* Submit */}
          <Button
            title={loading ? (isEdit ? 'Saving Changes...' : 'Creating Saree...') : (isEdit ? 'Save Changes' : 'Create Saree')}
            onPress={handleSubmit}
            loading={loading}
            icon={!loading && <Ionicons name="checkmark-circle" size={18} color={colors.white} />}
            style={{ marginTop: 8, marginBottom: 32 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Picker Modal */}
      <Modal visible={showCatPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCatPicker(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {categories.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Ionicons name="pricetags-outline" size={40} color={colors.textMuted} />
                <Text style={styles.modalEmptyText}>No categories yet</Text>
                <Button
                  title="Create Category"
                  variant="outline"
                  onPress={() => { setShowCatPicker(false); navigation.navigate('Categories'); }}
                  style={{ marginTop: 12 }}
                />
              </View>
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.catOption, selectedCategory?._id === item._id && styles.catOptionActive]}
                    onPress={() => { setSelectedCategory(item); setShowCatPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.catOptionLeft}>
                      <Ionicons
                        name="pricetag"
                        size={18}
                        color={selectedCategory?._id === item._id ? colors.primary : colors.textMuted}
                      />
                      <View>
                        <Text style={[styles.catOptionName, selectedCategory?._id === item._id && styles.catOptionNameActive]}>
                          {item.name}
                        </Text>
                        {item.fabric || item.occasion ? (
                          <Text style={styles.catOptionMeta}>
                            {[item.fabric, item.occasion].filter(Boolean).join(' · ')}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {selectedCategory?._id === item._id && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListFooterComponent={
                  <TouchableOpacity
                    style={styles.addCatBtn}
                    onPress={() => { setShowCatPicker(false); navigation.navigate('Categories'); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                    <Text style={styles.addCatBtnText}>Create New Category</Text>
                  </TouchableOpacity>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <ZoomableImageModal
        visible={showGeneratedPreview && !!generatedImage?.imageUrl}
        imageUri={generatedImage?.imageUrl}
        title="Generated Image"
        onClose={() => setShowGeneratedPreview(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingTop: 56 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(230,57,70,0.12)', padding: 12, borderRadius: borderRadius.md,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(230,57,70,0.25)',
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },

  // Section cards
  sectionCard: {
    backgroundColor: colors.card, borderRadius: borderRadius.xl,
    padding: 18, marginBottom: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },

  // Images
  addImage: {
    width: 80, height: 100, backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  addImageText: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  imageThumb: { width: 80, height: 100, borderRadius: borderRadius.md, overflow: 'hidden', marginRight: 8, position: 'relative' },
  thumbImg: { width: '100%', height: '100%' },
  removeImg: { position: 'absolute', top: 2, right: 2 },
  generatedWrap: { marginTop: 12 },
  generatedLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  generatedPreviewButton: {
    height: 300,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  generatedImage: { width: '100%', height: '100%' },
  zoomOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  zoomOverlayText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  previewHint: { color: colors.textMuted, fontSize: 11, marginTop: 7 },

  // Category picker
  fieldLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  categoryPicker: {
    backgroundColor: colors.surfaceLight, borderRadius: borderRadius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  selectedCat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectedCatText: { color: colors.text, fontSize: 15, fontWeight: '500', flex: 1 },
  clearCat: { padding: 2 },
  placeholderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeholderText: { color: colors.textMuted, fontSize: 15, flex: 1 },
  manageCatLink: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, alignSelf: 'flex-start',
  },
  manageCatText: { color: colors.primary, fontSize: 13, fontWeight: '500' },

  // Category modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, maxHeight: '70%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  modalEmpty: { alignItems: 'center', paddingVertical: 40 },
  modalEmptyText: { color: colors.textMuted, fontSize: 15, marginTop: 8 },
  catOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: borderRadius.md, marginBottom: 6,
    backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.border,
  },
  catOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  catOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  catOptionName: { color: colors.text, fontSize: 15, fontWeight: '500' },
  catOptionNameActive: { color: colors.primary, fontWeight: '600' },
  catOptionMeta: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  addCatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: borderRadius.md, marginTop: 4,
    borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed',
  },
  addCatBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },

  // Garment Type Selector
  garmentTypeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  garmentTypeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  garmentTypeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
  garmentTypeText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
  garmentTypeTextActive: { color: colors.primary, fontWeight: '600' },
});
