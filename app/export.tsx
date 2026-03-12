import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import MarkdownExport from '@/components/MarkdownExport';
import { useRouter } from 'expo-router';

export default function ExportScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();
  
  const handleClose = () => {
    router.back();
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: "Export Archive",
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
        }} 
      />
      
      <MarkdownExport onClose={handleClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});