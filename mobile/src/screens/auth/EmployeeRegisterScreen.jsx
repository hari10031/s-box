import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { registerEmployee } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function EmployeeRegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', username: '', password: '', storeCode: '', contact: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleRegister = async () => {
    if (!form.name || !form.username || !form.password || !form.storeCode) {
      setError('All fields except contact are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerEmployee(form);
      Alert.alert('Success', 'Registration submitted! Waiting for admin approval.', [
        { text: 'OK', onPress: () => navigation?.goBack?.() },
      ]);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Employee Registration</Text>
        <Text style={styles.subtitle}>Enter your store code to register</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <FormInput label="Full Name" value={form.name} onChangeText={(v) => update('name', v)} placeholder="Your full name" />
        <FormInput label="Username" value={form.username} onChangeText={(v) => update('username', v)} placeholder="Choose a username" autoCapitalize="none" />
        <FormInput label="Password" value={form.password} onChangeText={(v) => update('password', v)} placeholder="Choose a password" secureTextEntry />
        <FormInput label="Store Code" value={form.storeCode} onChangeText={(v) => update('storeCode', v)} placeholder="Enter your store code" autoCapitalize="characters" />
        <FormInput label="Contact (Optional)" value={form.contact} onChangeText={(v) => update('contact', v)} placeholder="Phone number" keyboardType="phone-pad" />

        <Button title="Submit Registration" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
        <Button title="Back to Login" onPress={() => navigation?.goBack?.()} variant="outline" style={{ marginTop: 12 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  errorBox: { backgroundColor: 'rgba(230,57,70,0.15)', padding: 12, borderRadius: borderRadius.sm, marginBottom: 16 },
  errorText: { color: colors.error, fontSize: 13 },
});
