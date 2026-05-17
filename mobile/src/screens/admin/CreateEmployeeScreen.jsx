import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import { createEmployee } from '../../api/users';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function CreateEmployeeScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', username: '', password: '', contact: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (k, v) => setForm({ ...form, [k]: v });

  const handleCreate = async () => {
    if (!form.name || !form.username || !form.password) { setError('All fields required'); return; }
    setError(''); setLoading(true);
    try {
      await createEmployee(form);
      Alert.alert('Success', 'Employee created', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Employee</Text>
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
        <FormInput label="Full Name" value={form.name} onChangeText={v => update('name', v)} placeholder="Employee name" />
        <FormInput label="Username" value={form.username} onChangeText={v => update('username', v)} placeholder="Username" autoCapitalize="none" />
        <FormInput label="Password" value={form.password} onChangeText={v => update('password', v)} placeholder="Password" secureTextEntry />
        <FormInput label="Contact" value={form.contact} onChangeText={v => update('contact', v)} placeholder="Phone" keyboardType="phone-pad" />
        <Button title="Create Employee" onPress={handleCreate} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 },
  errorBox: { backgroundColor: 'rgba(230,57,70,0.15)', padding: 12, borderRadius: borderRadius.sm, marginBottom: 16 },
  errorText: { color: colors.error, fontSize: 13 },
});
