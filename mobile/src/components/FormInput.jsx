import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { borderRadius } from '../theme/spacing';

export default function FormInput({
  label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType, multiline, numberOfLines, style, error, ...props
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: colors.surfaceLight, color: colors.text, borderRadius: borderRadius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 12, marginTop: 4 },
});
