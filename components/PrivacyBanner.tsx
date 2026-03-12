import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, Lock, WifiOff } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { usePrivacyStore } from '@/store/privacyStore';

export default function PrivacyBanner() {
  const { colors } = useThemeStore();
  const { isPrivacyModeEnabled } = usePrivacyStore();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
      <View style={styles.iconContainer}>
        {isPrivacyModeEnabled ? (
          <Lock size={20} color={colors.primary} />
        ) : (
          <Shield size={20} color={colors.primary} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.primary }]}>
          {isPrivacyModeEnabled ? 'Privacy Mode Active' : 'Your Data is Protected'}
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {isPrivacyModeEnabled 
            ? 'Network access is blocked. Your archive is completely isolated.' 
            : 'Your archive is stored only on this device and never shared.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
  },
});