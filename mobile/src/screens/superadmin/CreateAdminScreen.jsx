import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { createAdmin } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function CreateAdminScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '', email: '', username: '', password: '',
    contact: '', imageUploadLimit: '500',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const update = (k, v) => setForm({ ...form, [k]: v });

  const validateEmail = (email) => {
    if (!email) return true; // email is optional
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleCreate = async () => {
    if (!form.name || !form.username || !form.password) {
      setError('Name, username, and password are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.email && !validateEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createAdmin({
        ...form,
        imageUploadLimit: Number(form.imageUploadLimit) || 500,
      });
      Alert.alert('✅ Success', 'Admin account created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Create Admin</Text>
              <Text style={styles.subtitle}>Set up a new store admin account</Text>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Account Info Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '25' }]}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Account Information</Text>
            </View>

            <FormInput
              label="Full Name"
              value={form.name}
              onChangeText={(v) => update('name', v)}
              placeholder="Enter admin's full name"
            />
            <FormInput
              label="Email Address"
              value={form.email}
              onChangeText={(v) => update('email', v)}
              placeholder="admin@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              label="Username"
              value={form.username}
              onChangeText={(v) => update('username', v)}
              placeholder="Choose a unique username"
              autoCapitalize="none"
            />
            <View>
              <FormInput
                label="Password"
                value={form.password}
                onChangeText={(v) => update('password', v)}
                placeholder="Minimum 6 characters"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact & Settings Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.secondary + '25' }]}>
                <Ionicons name="settings" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.sectionTitle}>Contact & Settings</Text>
            </View>

            <FormInput
              label="Phone Number"
              value={form.contact}
              onChangeText={(v) => update('contact', v)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            <FormInput
              label="Image Upload Limit"
              value={form.imageUploadLimit}
              onChangeText={(v) => update('imageUploadLimit', v)}
              placeholder="500"
              keyboardType="numeric"
              style={{ marginBottom: 0 }}
            />
            <Text style={styles.fieldHint}>
              Maximum number of product images this admin can upload
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title="Create Admin Account"
            onPress={handleCreate}
            loading={loading}
            icon={!loading && <Ionicons name="person-add" size={18} color={colors.white} />}
            style={{ marginTop: 8, marginBottom: 32 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingTop: 56 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(230,57,70,0.12)',
    padding: 14,
    borderRadius: borderRadius.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.25)',
  },
  errorText: { color: colors.error, fontSize: 13, flex: 1 },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  fieldHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 32,
    padding: 4,
  },
});
