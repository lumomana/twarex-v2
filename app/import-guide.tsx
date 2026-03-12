import React from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import ArchiveImportGuide from '@/components/ArchiveImportGuide';

export default function ImportGuideScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: "Import Guide",
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <ArchiveImportGuide />
      
      <View style={[styles.footer, { backgroundColor: colors.headerBackground }]}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => router.push('/archive-settings')}
        >
          <Text style={[styles.footerButtonText, { color: colors.white }]}>Go to Import Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});