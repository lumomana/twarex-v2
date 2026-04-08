import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useArchiveStore } from '@/store/archiveStore';
import { Download, FileUp, RefreshCw, HelpCircle, AlertTriangle, CheckCircle, X, Trash2 } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parseTwitterArchive, validateTwitterArchive } from '@/utils/archiveParser';
import type { ArchiveData } from '@/types/twitter';
import { mockTwitterArchive } from '@/mocks/twitterData';

export default function ArchiveSettingsScreen() {
  const { colors } = useThemeStore();
  const { setArchiveData, setLoading, isLoading, setArchiveSource, archiveSource } = useArchiveStore();
  const router = useRouter();
  
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState<string>('');
  
  const processArchiveFile = async (arrayBuffer: ArrayBuffer) => {
    try {
      setImportMessage('Validating archive...');
      
      // Validate the archive
      const validation = await validateTwitterArchive(arrayBuffer);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      setImportMessage('Parsing archive data...');
      
      // Parse the archive
      const archiveData = await parseTwitterArchive(arrayBuffer);
      
      if (archiveData.totalTweets === 0) {
        throw new Error('No tweets found in the archive');
      }
      
      setImportMessage('Saving archive...');
      
      // Set the archive data
      setArchiveData(archiveData);
      setArchiveSource('imported');
      
      setImportStatus('success');
      setImportMessage(
        `Archive importée avec succès ! ${archiveData.totalTweets.toLocaleString()} tweets chargés.`
      );
      
      // Reset after a delay
      setTimeout(() => {
        setImportStatus('idle');
        setImportMessage('');
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Error processing archive:', error);
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleImportArchive = async () => {
    if (Platform.OS === 'web') {
      // Use native HTML file input for web to avoid expo-document-picker issues
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', '.zip,application/zip,application/x-zip-compressed');
      
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setImportStatus('loading');
        setImportMessage('Reading file...');
        
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            if (arrayBuffer) {
              await processArchiveFile(arrayBuffer);
            } else {
              setImportStatus('error');
              setImportMessage("Failed to read file content");
            }
          };
          reader.onerror = () => {
            setImportStatus('error');
            setImportMessage("FileReader error");
          };
          reader.readAsArrayBuffer(file);
        } catch (err) {
          setImportStatus('error');
          setImportMessage(err instanceof Error ? err.message : "File selection error");
        }
      };
      
      input.click();
    } else {
      // Native (Android/iOS) handling using expo-document-picker and expo-file-system
      try {
        setImportStatus('loading');
        setImportMessage('Selecting file...');
        
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/zip', 'application/x-zip-compressed'],
          copyToCacheDirectory: true
        });
        
        if (result.canceled) {
          setImportStatus('idle');
          setImportMessage('');
          return;
        }
        
        setImportMessage('Processing archive...');
        const fileUri = result.assets[0].uri;
        
        const base64Data = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        await processArchiveFile(bytes.buffer);
      } catch (error) {
        setImportStatus('error');
        setImportMessage(error instanceof Error ? error.message : 'Selection failed');
      }
    }
  };
  
  const handleResetToMockData = () => {
    Alert.alert(
      "Reset to Sample Data",
      "This will replace your current archive with sample data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: () => {
            setArchiveData(mockTwitterArchive);
            setArchiveSource('mock');
            Alert.alert("Reset Complete", "Sample data has been loaded.");
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleDeleteArchive = () => {
    Alert.alert(
      "Delete Archive",
      "This will permanently delete your imported Twitter archive from this app. You'll need to import it again if you want to view it. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setArchiveData(mockTwitterArchive);
              setArchiveSource('mock');
              if (Platform.OS !== 'web') {
                const cacheDir = `${FileSystem.cacheDirectory}twitter-archive/`;
                const cacheDirInfo = await FileSystem.getInfoAsync(cacheDir);
                if (cacheDirInfo.exists) {
                  await FileSystem.deleteAsync(cacheDir, { idempotent: true });
                }
              }
              Alert.alert("Archive Deleted", "Your Twitter archive has been deleted.");
            } catch (error) {
              Alert.alert("Error", "Problem deleting archive.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: "Archive Settings",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Import Twitter Archive</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Import your Twitter archive to view your tweets, media, and engagement metrics.
          </Text>
          
          <View style={[styles.instructionsContainer, { backgroundColor: colors.lightGray, borderColor: colors.border }]}>
            <Text style={[styles.instructionsTitle, { color: colors.text }]}>How to get your Twitter archive:</Text>
            <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>1. Go to Twitter.com and log in</Text>
            <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>2. Click "More" → "Settings and privacy"</Text>
            <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>3. "Your account" → "Download an archive"</Text>
            <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>4. Confirm password and request archive</Text>
            <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>5. Wait for Twitter email</Text>
            <Text style={[styles.instructionStep, { color: colors.textSecondary }]}>6. Download ZIP and import here</Text>
          </View>
          
          {importStatus !== 'idle' && (
            <View style={[
              styles.statusContainer, 
              { 
                backgroundColor: 
                  importStatus === 'loading' ? colors.lightGray : 
                  importStatus === 'success' ? colors.primaryLight : 
                  colors.error + '20',
                borderColor: 
                  importStatus === 'loading' ? colors.border : 
                  importStatus === 'success' ? colors.primary : 
                  colors.error
              }
            ]}>
              {importStatus === 'loading' && (
                <View style={styles.loadingIndicator}>
                  <RefreshCw size={20} color={colors.primary} style={styles.spinningIcon} />
                  <Text style={[styles.statusText, { color: colors.text }]}>{importMessage}</Text>
                </View>
              )}
              {importStatus === 'success' && (
                <View style={styles.statusContent}>
                  <CheckCircle size={20} color={colors.primary} style={styles.statusIcon} />
                  <Text style={[styles.statusText, { color: colors.text }]}>{importMessage}</Text>
                </View>
              )}
              {importStatus === 'error' && (
                <View style={styles.statusContent}>
                  <AlertTriangle size={20} color={colors.error} style={styles.statusIcon} />
                  <Text style={[styles.statusText, { color: colors.error }]}>Error: {importMessage}</Text>
                </View>
              )}
            </View>
          )}
          
          <TouchableOpacity 
            style={[
              styles.importButton, 
              { backgroundColor: colors.primary },
              importStatus === 'loading' && { opacity: 0.7 }
            ]}
            onPress={handleImportArchive}
            disabled={importStatus === 'loading'}
          >
            <FileUp size={20} color={colors.white} style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Import Twitter Archive
            </Text>
          </TouchableOpacity>
        </View>

        {archiveSource === 'imported' && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Current Archive</Text>
            <TouchableOpacity 
              style={[styles.deleteButton, { borderColor: colors.error, backgroundColor: colors.error + '10' }]}
              onPress={handleDeleteArchive}
            >
              <Trash2 size={20} color={colors.error} style={styles.buttonIcon} />
              <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete Archive</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reset App</Text>
          <TouchableOpacity 
            style={[styles.resetButton, { borderColor: colors.border, backgroundColor: colors.lightGray }]}
            onPress={handleResetToMockData}
          >
            <RefreshCw size={20} color={colors.text} style={styles.buttonIcon} />
            <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset to Sample Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  section: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sectionDescription: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  instructionsContainer: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  instructionsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  instructionStep: { fontSize: 13, marginBottom: 4 },
  statusContainer: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  loadingIndicator: { flexDirection: 'row', alignItems: 'center' },
  statusContent: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '500' },
  spinningIcon: { marginRight: 8 },
  importButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 8 },
  buttonIcon: { marginRight: 8 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 8 },
  deleteButtonText: { fontSize: 14, fontWeight: '600' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 8 },
  resetButtonText: { fontSize: 14, fontWeight: '600' },
});
