import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Shield, Lock, WifiOff, Eye, FileText, Server } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const { colors } = useThemeStore();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: "Privacy Policy" }} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Shield size={40} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            How we protect your Twitter archive data
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Lock size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Storage</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Your Twitter archive data is stored exclusively on your device. We use secure local storage 
            with encryption to protect your data from unauthorized access.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Your archive data is automatically encrypted using industry-standard 
            encryption algorithms before being stored on your device.
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <WifiOff size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Network Access</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            This app is designed to work completely offline. When "Block Network Access" is enabled, 
            the app will not make any network connections, ensuring your data never leaves your device.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            The only network connections made by default are to load profile images and media from tweets, 
            which can be disabled in privacy settings.
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Collection</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We do not collect, transmit, or store any of your personal data or Twitter archive content 
            on our servers. All processing happens locally on your device.
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We do not use analytics, tracking, or any other monitoring tools in this application.
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Server size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Third-Party Services</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            This app does not integrate with any third-party services or APIs that would have access 
            to your Twitter archive data.
          </Text>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <FileText size={24} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rights</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            Since we don't collect or store your data on our servers, you maintain complete control 
            over your information. You can delete the app and all associated data at any time.
          </Text>
        </View>
        
        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          Last updated: June 2023
        </Text>
      </ScrollView>
      
      <View style={[styles.actionFooter, { backgroundColor: colors.headerBackground }]}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.footerButtonText, { color: colors.white }]}>Back to App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 24,
  },
  actionFooter: {
    padding: 16,
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});