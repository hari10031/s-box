import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import colors from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  return (
    <LinearGradient colors={[colors.background, colors.surface]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.brand}>✦ SAREES</Text>
            <Text style={styles.tagline}>Premium Saree Collection</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

            <FormInput label="Username" value={username} onChangeText={setUsername} placeholder="Enter your username" autoCapitalize="none" />
            <FormInput label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry />

            <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />

            <TouchableOpacity onPress={() => navigation?.navigate?.('EmployeeRegister')} style={styles.registerLink}>
              <Text style={styles.registerText}>Employee? <Text style={styles.registerHighlight}>Register here</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  brand: { fontSize: 36, fontWeight: '800', color: colors.secondary, letterSpacing: 6 },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 8, letterSpacing: 2 },
  card: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: 28, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  errorBox: { backgroundColor: 'rgba(230,57,70,0.15)', padding: 12, borderRadius: borderRadius.sm, marginBottom: 16 },
  errorText: { color: colors.error, fontSize: 13 },
  btn: { marginTop: 8 },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { color: colors.textSecondary, fontSize: 14 },
  registerHighlight: { color: colors.primary, fontWeight: '600' },
});
