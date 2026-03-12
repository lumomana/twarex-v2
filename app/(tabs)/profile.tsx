import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Calendar, Download, FileText, Settings, Shield, WifiOff, Printer, BookOpen, Trash2, HelpCircle, FolderArchive, FileUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { usePrivacyStore } from '@/store/privacyStore';
import { useArchiveStore } from '@/store/archiveStore';
import { useLanguageStore } from '@/store/languageStore';
import ExportButton from '@/components/ExportButton';
import LanguageSelector from '@/components/LanguageSelector';

export default function ProfileScreen() {
  const { colors } = useThemeStore();
  const { isPrivacyModeEnabled, networkAccessBlocked, togglePrivacyMode, toggleNetworkAccess } = usePrivacyStore();
  const { archiveSource } = useArchiveStore();
  const { t } = useLanguageStore();
  const router = useRouter();
  
  const handleArchiveSettings = () => {
    router.push('/archive-settings');
  };
  
  const handleImportGuide = () => {
    router.push('/import-guide');
  };
  
  const handlePrivacySettings = () => {
    router.push('/privacy');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.white }]}>{t('profile.title')}</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.profileSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }} 
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>Elena Moreno</Text>
            <Text style={[styles.profileHandle, { color: colors.textSecondary }]}>@elenamoreno_edu</Text>
            <Text style={[styles.profileBio, { color: colors.textSecondary }]}>
              High school literature teacher 📚 | Education advocate | Coffee enthusiast | Sharing classroom insights and book recommendations since 2012
            </Text>
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('archive.settings')}</Text>
          
          <View style={styles.sectionContent}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.archiveSource')}:</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {archiveSource === 'mock' ? t('profile.sampleData') : t('profile.imported')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={handleArchiveSettings}
            >
              <FileUp size={20} color={colors.white} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: colors.white }]}>{t('archive.import')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleImportGuide}
            >
              <HelpCircle size={20} color={colors.primary} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: colors.text }]}>{t('profile.importGuide')}</Text>
            </TouchableOpacity>
            
            {archiveSource === 'imported' && (
              <View style={styles.exportContainer}>
                <ExportButton />
              </View>
            )}
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.privacy')}</Text>
          
          <View style={styles.sectionContent}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.privacyMode')}</Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  {t('profile.privacyModeDesc')}
                </Text>
              </View>
              <Switch
                value={isPrivacyModeEnabled}
                onValueChange={togglePrivacyMode}
                trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
                thumbColor={isPrivacyModeEnabled ? colors.primary : colors.secondary}
              />
            </View>
            
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.blockNetwork')}</Text>
                <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                  {t('profile.blockNetworkDesc')}
                </Text>
              </View>
              <Switch
                value={networkAccessBlocked}
                onValueChange={toggleNetworkAccess}
                trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
                thumbColor={networkAccessBlocked ? colors.primary : colors.secondary}
                disabled={isPrivacyModeEnabled} // Disabled when privacy mode is on
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handlePrivacySettings}
            >
              <Shield size={20} color={colors.primary} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: colors.text }]}>{t('profile.privacyPolicy')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.language')}</Text>
          
          <View style={styles.sectionContent}>
            <TouchableOpacity style={[styles.languageSelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LanguageSelector showLabel={true} size={20} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.about')}</Text>
          
          <View style={styles.sectionContent}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('common.version')}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('common.lastUpdated')}</Text>
            </View>
            
            <View style={[styles.statRow, { justifyContent: 'flex-start' }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary, marginRight: 8 }]}>{t('common.by')}:</Text>
              <Text style={[styles.statValue, { color: colors.text, fontWeight: 'bold' }]}>lumomana</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.footerContent}>
          <Image 
            source={require('@/assets/images/icon.png')}
            style={styles.footerIcon}
          />
          <Text style={[styles.footerText, { color: colors.white }]}>
            {t('app.name')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileHandle: {
    fontSize: 14,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  sectionContent: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  exportContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});