import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, Home, Shield } from 'lucide-react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import { usePrivacyStore } from '@/store/privacyStore';
import { useLanguageStore } from '@/store/languageStore';
import { TimelineLevel } from '@/types/twitter';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { useRouter } from 'expo-router';

interface TimelineHeaderProps {
  onSearch?: () => void;
}

export default function TimelineHeader({ onSearch }: TimelineHeaderProps) {
  const { 
    currentLevel, 
    selectedYear, 
    selectedMonth, 
    selectedDay,
    navigateToLevel
  } = useArchiveStore();
  
  const { colors } = useThemeStore();
  const { isPrivacyModeEnabled } = usePrivacyStore();
  const { t } = useLanguageStore();
  const router = useRouter();

  const getTitle = () => {
    switch (currentLevel) {
      case 'global':
        return t('timeline.title');
      case 'year':
        return selectedYear || 'Year';
      case 'month': {
        if (!selectedMonth) return 'Month';
        const date = new Date(selectedMonth + '-01');
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      case 'day': {
        if (!selectedDay) return 'Day';
        const date = new Date(selectedDay);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      }
      case 'tweet':
        return t('timeline.tweet');
      default:
        return t('timeline.title');
    }
  };

  const handleBack = () => {
    const levels: TimelineLevel[] = ['global', 'year', 'month', 'day', 'tweet'];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex > 0) {
      navigateToLevel(levels[currentIndex - 1]);
    }
  };

  const navigateToPrivacyPolicy = () => {
    router.push('/privacy');
  };

  const canGoBack = currentLevel !== 'global';

  return (
    <View style={[styles.container, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
      <View style={styles.navigationContainer}>
        {canGoBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft color={colors.white} size={24} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigateToLevel('global')} style={styles.homeButton}>
            <Home color={colors.white} size={22} />
          </TouchableOpacity>
        )}
        <Text style={[styles.title, { color: colors.white }]}>{getTitle()}</Text>
        <View style={styles.rightContainer}>
          {/* Privacy icon with different color when privacy mode is active */}
          <TouchableOpacity 
            onPress={navigateToPrivacyPolicy}
            style={[
              styles.iconButton, 
              { backgroundColor: isPrivacyModeEnabled ? colors.primaryLight : 'transparent' }
            ]}
          >
            <Shield 
              size={20} 
              color={isPrivacyModeEnabled ? colors.primary : colors.white} 
            />
          </TouchableOpacity>
          
          {/* Language selector */}
          <View style={styles.iconButton}>
            <LanguageSelector size={20} />
          </View>
          
          {/* Theme toggle */}
          <ThemeToggle size={20} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  homeButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
});