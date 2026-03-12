import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Create a storage adapter that uses SecureStore on native platforms
// and falls back to AsyncStorage on web
const createSecureStorage = () => {
  // For web, we have to use AsyncStorage
  if (Platform.OS === 'web') {
    return AsyncStorage;
  }
  
  // For native platforms, use SecureStore
  return {
    getItem: async (name: string) => {
      return await SecureStore.getItemAsync(name);
    },
    setItem: async (name: string, value: string) => {
      await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string) => {
      await SecureStore.deleteItemAsync(name);
    },
  };
};

interface PrivacyState {
  isPrivacyModeEnabled: boolean;
  networkAccessBlocked: boolean;
  
  // Actions
  togglePrivacyMode: () => void;
  toggleNetworkAccess: () => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      isPrivacyModeEnabled: false,
      networkAccessBlocked: false,
      
      togglePrivacyMode: () => set((state) => {
        const newMode = !state.isPrivacyModeEnabled;
        // When enabling privacy mode, also block network access
        return {
          isPrivacyModeEnabled: newMode,
          networkAccessBlocked: newMode ? true : state.networkAccessBlocked,
        };
      }),
      
      toggleNetworkAccess: () => set((state) => ({
        networkAccessBlocked: !state.networkAccessBlocked,
      })),
    }),
    {
      name: 'privacy-settings',
      storage: createJSONStorage(() => createSecureStorage()),
    }
  )
);