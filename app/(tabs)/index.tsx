import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import { usePrivacyStore } from '@/store/privacyStore';
import TimelineHeader from '@/components/TimelineHeader';
import GlobalView from '@/components/GlobalView';
import YearView from '@/components/YearView';
import MonthView from '@/components/MonthView';
import DayView from '@/components/DayView';
import TweetView from '@/components/TweetView';

export default function TimelineScreen() {
  const { currentLevel } = useArchiveStore();
  const { colors, mode } = useThemeStore();

  // Add a web-specific error handler
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // This helps prevent some permission errors in web environment
      const originalAddEventListener = window.EventTarget.prototype.addEventListener;
      window.EventTarget.prototype.addEventListener = function(type, listener, options) {
        try {
          return originalAddEventListener.call(this, type, listener, options);
        } catch (e) {
          console.warn('Event listener error suppressed:', e);
          return originalAddEventListener.call(this, type, listener);
        }
      };
    }
  }, []);

  const renderContent = () => {
    switch (currentLevel) {
      case 'global':
        return <GlobalView />;
      case 'year':
        return <YearView />;
      case 'month':
        return <MonthView />;
      case 'day':
        return <DayView />;
      case 'tweet':
        return <TweetView />;
      default:
        return <GlobalView />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <TimelineHeader />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});