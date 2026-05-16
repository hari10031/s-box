import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { setAdminLimit, getAdminDetail } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function AdminDetailScreen({ route, navigation }) {
  const adminId = route.params.admin._id;
  const [admin, setAdmin] = useState(route.params.admin);
  const [limit, setLimit] = useState(String(route.params.admin.imageUploadLimit));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchAdmin = useCallback(async () => {
    try {
      const { data } = await getAdminDetail(adminId);
      setAdmin(data);
      setLimit(String(data.imageUploadLimit));
    } catch (err) {
      console.error('Failed to fetch admin:', err);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  }, [adminId]);

  useEffect(() => { fetchAdmin(); }, [fetchAdmin]);

  const handleUpdateLimit = async () => {
    const num = Number(limit);
    if (!num || num < 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }
    setLoading(true);
    try {
      await setAdminLimit(admin._id, num);
      Alert.alert('✅ Success', 'Image upload limit updated!');
      fetchAdmin(); // refresh data after update
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    Alert.alert('Store Code', text);
  };

  const usagePercent = admin.imageUploadLimit
    ? Math.min(100, Math.round((admin.imageUploadCount / admin.imageUploadLimit) * 100))
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAdmin(); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {admin.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{admin.name}</Text>
          <Text style={styles.username}>@{admin.username}</Text>
          <StatusBadge status={admin.status} style={{ marginTop: 10 }} />

          {/* Contact Info */}
          <View style={styles.contactGrid}>
            {admin.email ? (
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
                <Text style={styles.contactText}>{admin.email}</Text>
              </View>
            ) : null}
            {admin.contact ? (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={colors.textMuted} />
                <Text style={styles.contactText}>{admin.contact}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Usage Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="images-outline" size={20} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{admin.imageUploadCount}</Text>
            <Text style={styles.statLabel}>Images Used</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>{admin.imageUploadLimit}</Text>
            <Text style={styles.statLabel}>Upload Limit</Text>
          </View>
        </View>

        {/* Usage Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Usage</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${usagePercent}%`,
                    backgroundColor: usagePercent > 80 ? colors.error : usagePercent > 50 ? colors.warning : colors.success,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{usagePercent}% used</Text>
          </View>
        </View>

        {/* Update Limit */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="settings-outline" size={18} color={colors.text} />
            <Text style={styles.sectionTitle}>Update Image Limit</Text>
          </View>
          <FormInput
            label="New Limit"
            value={limit}
            onChangeText={setLimit}
            keyboardType="numeric"
            placeholder="Enter new limit"
          />
          <Button
            title="Update Limit"
            onPress={handleUpdateLimit}
            loading={loading}
            icon={!loading && <Ionicons name="save-outline" size={16} color={colors.white} />}
          />
        </View>

        {/* Store Code */}
        {admin.storeCode && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="storefront-outline" size={18} color={colors.text} />
              <Text style={styles.sectionTitle}>Store Code</Text>
            </View>
            <TouchableOpacity
              style={styles.codeBox}
              onPress={() => copyToClipboard(admin.storeCode)}
              activeOpacity={0.7}
            >
              <Text style={styles.codeText}>{admin.storeCode}</Text>
              <Ionicons name="copy-outline" size={18} color={colors.secondary} />
            </TouchableOpacity>
            <Text style={styles.hint}>
              Tap to copy • Employees use this code to self-register
            </Text>
          </View>
        )}

        {/* Created At */}
        {admin.createdAt && (
          <View style={styles.footerInfo}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.footerText}>
              Created {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingTop: 52, paddingBottom: 32 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: '700' },
  name: { color: colors.text, fontSize: 22, fontWeight: '700' },
  username: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  contactGrid: {
    marginTop: 16,
    gap: 8,
    width: '100%',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '700' },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  progressContainer: {
    marginTop: 4,
    gap: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: 18,
  },
  codeText: {
    color: colors.secondary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 16,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
