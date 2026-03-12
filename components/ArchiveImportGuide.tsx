import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Download, FileUp, HelpCircle } from 'lucide-react-native';

export default function ArchiveImportGuide() {
  const { colors } = useThemeStore();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <FileUp size={40} color={colors.primary} style={styles.headerIcon} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>How to Import Your Twitter Archive</Text>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Step 1: Request Your Archive</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          First, you need to request your Twitter archive from Twitter. Here's how:
        </Text>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            1. Go to Twitter.com and log in to your account
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            2. Click on "More" in the sidebar, then "Settings and privacy"
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            3. Go to "Your account" → "Download an archive of your data"
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            4. Confirm your password and request the archive
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            5. Twitter will email you when your archive is ready to download
          </Text>
        </View>
        
        <View style={[styles.note, { backgroundColor: colors.lightGray }]}>
          <HelpCircle size={20} color={colors.primary} style={styles.noteIcon} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            Note: It may take Twitter several days to prepare your archive, especially if you have a lot of tweets.
          </Text>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Step 2: Download Your Archive</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          Once Twitter notifies you that your archive is ready:
        </Text>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            1. Click the download link in the email from Twitter
          </Text>
        </View>
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            2. Log in to your Twitter account if prompted
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            3. Download the ZIP file to your device
          </Text>
        </View>
        
        <View style={[styles.imageContainer, { borderColor: colors.border }]}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }} 
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={[styles.imageCaption, { color: colors.textSecondary }]}>
            Example of Twitter archive download page
          </Text>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Step 3: Import Into This App</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          Now that you have your Twitter archive ZIP file:
        </Text>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            1. Go to the Archive Settings screen in this app
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            2. Tap "Import Twitter Archive"
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            3. Select the ZIP file you downloaded from Twitter
          </Text>
        </View>
        
        <View style={[styles.step, { borderLeftColor: colors.primary }]}>
          <Text style={[styles.stepText, { color: colors.text }]}>
            4. Wait for the import to complete
          </Text>
        </View>
        
        <View style={[styles.note, { backgroundColor: colors.lightGray }]}>
          <HelpCircle size={20} color={colors.primary} style={styles.noteIcon} />
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            The import process may take several minutes depending on the size of your archive and your device's performance.
          </Text>
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>What's Included in Your Archive</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          Your Twitter archive typically includes:
        </Text>
        
        <View style={styles.bulletList}>
          <View style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text style={[styles.bulletText, { color: colors.text }]}>All your tweets, including retweets and replies</Text>
          </View>
          
          <View style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text style={[styles.bulletText, { color: colors.text }]}>Media you've shared (images, videos)</Text>
          </View>
          
          <View style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text style={[styles.bulletText, { color: colors.text }]}>Engagement metrics (likes, retweets)</Text>
          </View>
          
          <View style={styles.bulletItem}>
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text style={[styles.bulletText, { color: colors.text }]}>Account information and settings</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Download size={20} color={colors.primary} style={styles.footerIcon} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Ready to import your Twitter archive? Go to Archive Settings!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  step: {
    paddingLeft: 16,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteIcon: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  noteText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  imageContainer: {
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageCaption: {
    fontSize: 12,
    textAlign: 'center',
    padding: 8,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 32,
  },
  footerIcon: {
    marginRight: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});