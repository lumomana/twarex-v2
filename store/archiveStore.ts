import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArchiveData, DayData, MonthData, TimelineLevel, Tweet, YearData } from '@/types/twitter';
import { mockTwitterArchive } from '@/mocks/twitterData';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Import preloaded data if available
let preloadedData: ArchiveData | null = null;
try {
  // Use require for static asset in Expo
  preloadedData = require('../assets/preloaded_data.json');
  console.log('Preloaded data found:', preloadedData?.totalTweets, 'tweets');
} catch (e) {
  console.log('No preloaded data found, using mock data.');
}

// Create a storage adapter
const createSecureArchiveStorage = () => {
  if (Platform.OS === 'web') {
    return AsyncStorage;
  }
  return {
    getItem: async (name: string) => {
      try {
        return await SecureStore.getItemAsync(name);
      } catch (e) {
        return await AsyncStorage.getItem(name);
      }
    },
    setItem: async (name: string, value: string) => {
      try {
        await SecureStore.setItemAsync(name, value);
      } catch (e) {
        await AsyncStorage.setItem(name, value);
      }
    },
    removeItem: async (name: string) => {
      try {
        await SecureStore.deleteItemAsync(name);
        await AsyncStorage.removeItem(name);
      } catch (e) {
        await AsyncStorage.removeItem(name);
      }
    },
  };
};

type ArchiveSource = 'mock' | 'imported' | 'preloaded';

interface ArchiveState {
  archiveData: ArchiveData;
  isLoading: boolean;
  archiveSource: ArchiveSource;
  currentLevel: TimelineLevel;
  selectedYear: string | null;
  selectedMonth: string | null;
  selectedDay: string | null;
  selectedTweet: string | null;
  setArchiveData: (data: ArchiveData) => void;
  setLoading: (loading: boolean) => void;
  setArchiveSource: (source: ArchiveSource) => void;
  navigateToLevel: (level: TimelineLevel) => void;
  selectYear: (year: string) => void;
  selectMonth: (month: string) => void;
  selectDay: (day: string) => void;
  selectTweet: (tweetId: string) => void;
  navigateToPreviousTweet: () => void;
  navigateToNextTweet: () => void;
  getCurrentYearData: () => YearData | null;
  getCurrentMonthData: () => MonthData | null;
  getCurrentDayData: () => DayData | null;
  getCurrentTweet: () => Tweet | null;
  hasPreviousTweet: () => boolean;
  hasNextTweet: () => boolean;
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set, get) => ({
      // Initial state: Use preloaded data if available, otherwise mock
      archiveData: preloadedData || mockTwitterArchive,
      isLoading: false,
      archiveSource: preloadedData ? 'preloaded' : 'mock',
      currentLevel: 'global',
      selectedYear: null,
      selectedMonth: null,
      selectedDay: null,
      selectedTweet: null,
      
      setArchiveData: (data) => set({ archiveData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      setArchiveSource: (source) => set({ archiveSource: source }),
      
      navigateToLevel: (level) => {
        if (level === 'global') {
          set({ currentLevel: level, selectedYear: null, selectedMonth: null, selectedDay: null, selectedTweet: null });
        } else if (level === 'year') {
          set({ currentLevel: level, selectedMonth: null, selectedDay: null, selectedTweet: null });
        } else if (level === 'month') {
          set({ currentLevel: level, selectedDay: null, selectedTweet: null });
        } else if (level === 'day') {
          set({ currentLevel: level, selectedTweet: null });
        } else {
          set({ currentLevel: level });
        }
      },
      
      selectYear: (year) => set({ selectedYear: year, currentLevel: 'year', selectedMonth: null, selectedDay: null, selectedTweet: null }),
      selectMonth: (month) => set({ selectedMonth: month, currentLevel: 'month', selectedDay: null, selectedTweet: null }),
      selectDay: (day) => set({ selectedDay: day, currentLevel: 'day', selectedTweet: null }),
      selectTweet: (tweetId) => set({ selectedTweet: tweetId, currentLevel: 'tweet' }),
      
      navigateToPreviousTweet: () => {
        const { archiveData, selectedYear, selectedMonth, selectedDay, selectedTweet } = get();
        if (!selectedYear || !selectedMonth || !selectedDay || !selectedTweet) return;
        const year = archiveData.years.find(y => y.year === selectedYear);
        if (!year) return;
        const month = year.months.find(m => m.month === selectedMonth);
        if (!month) return;
        const day = month.days.find(d => d.date === selectedDay);
        if (!day) return;
        const tweetIndex = day.tweets.findIndex(t => t.id === selectedTweet);
        if (tweetIndex > 0) {
          set({ selectedTweet: day.tweets[tweetIndex - 1].id });
        }
      },
      
      navigateToNextTweet: () => {
        const { archiveData, selectedYear, selectedMonth, selectedDay, selectedTweet } = get();
        if (!selectedYear || !selectedMonth || !selectedDay || !selectedTweet) return;
        const year = archiveData.years.find(y => y.year === selectedYear);
        if (!year) return;
        const month = year.months.find(m => m.month === selectedMonth);
        if (!month) return;
        const day = month.days.find(d => d.date === selectedDay);
        if (!day) return;
        const tweetIndex = day.tweets.findIndex(t => t.id === selectedTweet);
        if (tweetIndex < day.tweets.length - 1) {
          set({ selectedTweet: day.tweets[tweetIndex + 1].id });
        }
      },

      getCurrentYearData: () => {
        const { archiveData, selectedYear } = get();
        return archiveData.years.find(y => y.year === selectedYear) || null;
      },
      getCurrentMonthData: () => {
        const yearData = get().getCurrentYearData();
        if (!yearData) return null;
        return yearData.months.find(m => m.month === get().selectedMonth) || null;
      },
      getCurrentDayData: () => {
        const monthData = get().getCurrentMonthData();
        if (!monthData) return null;
        return monthData.days.find(d => d.date === get().selectedDay) || null;
      },
      getCurrentTweet: () => {
        const dayData = get().getCurrentDayData();
        if (!dayData) return null;
        return dayData.tweets.find(t => t.id === get().selectedTweet) || null;
      },
      hasPreviousTweet: () => {
        const dayData = get().getCurrentDayData();
        if (!dayData) return false;
        const index = dayData.tweets.findIndex(t => t.id === get().selectedTweet);
        return index > 0;
      },
      hasNextTweet: () => {
        const dayData = get().getCurrentDayData();
        if (!dayData) return false;
        const index = dayData.tweets.findIndex(t => t.id === get().selectedTweet);
        return index < dayData.tweets.length - 1;
      }
    }),
    {
      name: 'twitter-archive-storage',
      storage: createJSONStorage(createSecureArchiveStorage),
      // Only persist certain fields to avoid storage limits with 20k tweets
      partialize: (state) => {
        // On Web, we NEVER persist archiveData to avoid "Quota exceeded" errors
        // LocalStorage is limited to ~5MB, which is too small for large archives.
        if (Platform.OS === 'web') {
          return {
            archiveSource: state.archiveSource,
          };
        }
        
        // On Mobile, we persist if it's imported
        return {
          archiveData: state.archiveSource === 'imported' ? state.archiveData : undefined,
          archiveSource: state.archiveSource,
        };
      },
    }
  )
);
