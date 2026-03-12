import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';

interface ThemeToggleProps {
  size?: number;
}

export default function ThemeToggle({ size = 24 }: ThemeToggleProps) {
  const { mode, toggleTheme, colors } = useThemeStore();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.lightGray }]} 
      onPress={toggleTheme}
    >
      {mode === 'light' ? (
        <Moon size={size} color={colors.primary} />
      ) : (
        <Sun size={size} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});