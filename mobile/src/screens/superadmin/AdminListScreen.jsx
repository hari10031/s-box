import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { getAdmins, toggleBanAdmin } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function AdminListScreen({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdmins = useCallback(async () => {
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const { data } = await getAdmins(params);
      setAdmins(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAdmins();
    });
    return unsubscribe;
  }, [navigation, fetchAdmins]);

  useEffect(() => { fetchAdmins(); }, [searchQuery]);

  const handleToggleBan = (admin) => {
    const action = admin.status === 'banned' ? 'Unban' : 'Ban';
    Alert.alert(
      `${action} Admin`,
      `Are you sure you want to ${action.toLowerCase()} ${admin.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await toggleBanAdmin(admin._id);
              fetchAdmins();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed');
            }
          },
        },
      ]
    );
  };

  const renderAdmin = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AdminDetail', { admin: item })}
      activeOpacity={0.8}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {/* Card Details */}
      <View style={styles.detailsGrid}>
        {item.email ? (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>{item.email}</Text>
          </View>
        ) : null}
        {item.contact ? (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.contact}</Text>
          </View>
        ) : null}
        <View style={styles.detailRow}>
          <Ionicons name="images-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>
            {item.imageUploadCount}/{item.imageUploadLimit} images
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="storefront-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{item.storeCode || 'N/A'}</Text>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.actionBtn, item.status === 'banned' ? styles.unbanBtn : styles.banBtn]}
          onPress={() => handleToggleBan(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.status === 'banned' ? 'checkmark-circle-outline' : 'ban'}
            size={15}
            color={colors.white}
          />
          <Text style={styles.actionText}>
            {item.status === 'banned' ? 'Unban' : 'Ban'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => navigation.navigate('AdminDetail', { admin: item })}
          activeOpacity={0.7}
        >
          <Text style={styles.viewBtnText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Accounts</Text>
          <Text style={styles.headerSub}>
            {admins.length} admin{admins.length !== 1 ? 's' : ''} registered
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateAdmin')}
          activeOpacity={0.7}
        >
          <Ionicons name="person-add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search admins..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={admins}
        keyExtractor={(item) => item._id}
        renderItem={renderAdmin}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAdmins();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.empty}>
              {loading ? 'Loading admins...' : 'No admins found'}
            </Text>
            {!loading && (
              <Text style={styles.emptyHint}>
                Tap + to create a new admin account
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const avatarColors = [colors.primary, colors.accent, colors.secondary, colors.info, '#7C3AED'];
const getAvatarColor = (index) => avatarColors[index % avatarColors.length];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingRight: 64,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  headerSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    padding: 0,
  },
  list: { padding: 16, paddingTop: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1 },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  username: { color: colors.textMuted, fontSize: 13, marginTop: 1 },
  detailsGrid: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  banBtn: { backgroundColor: colors.error },
  unbanBtn: { backgroundColor: colors.success },
  actionText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
  },
  emptyHint: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
  },
});
