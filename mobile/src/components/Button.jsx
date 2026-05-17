import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { borderRadius } from '../theme/spacing';

export default function Button({ title, onPress, loading, variant = 'primary', style, textStyle, disabled, icon }) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={loading || disabled} style={[styles.wrapper, style]} activeOpacity={0.8}>
        <LinearGradient colors={[colors.primary, colors.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.gradient, (disabled || loading) && styles.disabled]}>
          {loading ? <ActivityIndicator color={colors.white} /> : (
            <>
              {icon}
              <Text style={[styles.text, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading || disabled} style={[styles.outline, (disabled || loading) && styles.disabled, style]} activeOpacity={0.8}>
      {loading ? <ActivityIndicator color={colors.primary} /> : (
        <>
          {icon}
          <Text style={[styles.outlineText, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: borderRadius.md, overflow: 'hidden' },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 24, borderRadius: borderRadius.md, gap: 8 },
  text: { color: colors.white, fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  outline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.primary, gap: 8 },
  outlineText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
