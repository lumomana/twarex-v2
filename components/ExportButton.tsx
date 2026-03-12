import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Download } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

export default function ExportButton() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  const handleExport = () => {
    router.push('/export');
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={handleExport}
    >
      <Download size={20} color={colors.white} style={styles.icon} />
      <Text style={[styles.text, { color: colors.white }]}>
        {t('profile.export')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});