import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Globe, Check } from 'lucide-react-native';
import { useLanguageStore, SupportedLanguage } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';

interface LanguageSelectorProps {
  size?: number;
  showLabel?: boolean;
}

export default function LanguageSelector({ size = 24, showLabel = false }: LanguageSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  const { colors } = useThemeStore();

  const languages = [
    { code: 'en', name: t('profile.english') },
    { code: 'fr', name: t('profile.french') },
    { code: 'es', name: t('profile.spanish') },
    { code: 'ja', name: t('profile.japanese') },
    { code: 'ar', name: t('profile.arabic') },
  ];

  const getLanguageDisplayName = (code: string) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code.toUpperCase();
  };

  const handleLanguageChange = (language: SupportedLanguage) => {
    setLanguage(language);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Globe size={size} color={colors.primary} />
        {showLabel && (
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {getLanguageDisplayName(currentLanguage)}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.language')}</Text>
            
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => handleLanguageChange(language.code as SupportedLanguage)}
              >
                <Text style={[styles.languageName, { color: colors.text }]}>
                  {language.name}
                </Text>
                {currentLanguage === language.code && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.white }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  languageName: {
    fontSize: 16,
  },
  closeButton: {
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});