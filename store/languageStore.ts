import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { translations, TranslationKeys } from '@/constants/translations';

// Get device language
const getDeviceLanguage = (): string => {
  if (Platform.OS === 'ios') {
    return (
      NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] ||
      'en'
    );
  } else if (Platform.OS === 'android') {
    return NativeModules.I18nManager.localeIdentifier || 'en';
  } else {
    return navigator.language || 'en';
  }
};

// Get the language code (first 2 characters)
const getLanguageCode = (): string => {
  const deviceLanguage = getDeviceLanguage();
  const languageCode = deviceLanguage.slice(0, 2).toLowerCase();
  
  // Check if the language is supported, otherwise default to English
  return Object.keys(translations).includes(languageCode) ? languageCode : 'en';
};

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'ja' | 'ar';

interface LanguageState {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: getLanguageCode() as SupportedLanguage,
      
      setLanguage: (language: SupportedLanguage) => {
        set({ currentLanguage: language });
      },
      
      t: (key: TranslationKeys, params?: Record<string, string | number>) => {
        const { currentLanguage } = get();
        const languageTranslations = translations[currentLanguage as keyof typeof translations] || translations.en;
        
        // Get the raw translation string
        let translation = (languageTranslations as any)[key] || (translations.en as any)[key] || key;
        
        // Replace parameters if provided (e.g., {{count}} or {count})
        if (params) {
          Object.entries(params).forEach(([paramKey, value]) => {
            // Support both {{key}} and {key} formats
            translation = translation.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), String(value));
            translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
          });
        }
        
        return translation;
      }
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
