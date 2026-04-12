import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Alert, Platform, PermissionsAndroid,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useArchiveStore } from '@/store/archiveStore';
import { FileUp, RefreshCw, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parseTwitterArchive, validateTwitterArchive } from '@/utils/archiveParser';
import { mockTwitterArchive } from '@/mocks/twitterData';

export default function ArchiveSettingsScreen() {
  const { colors } = useThemeStore();
  const { setArchiveData, setArchiveSource, archiveSource } = useArchiveStore();
  const router = useRouter();

  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState<string>('');

  // ── Traitement web (ArrayBuffer via FileReader) ──────────────────────────────
  const processArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
    try {
      setImportMessage('Validation de l\'archive...');
      const validation = await validateTwitterArchive(arrayBuffer);
      if (!validation.valid) throw new Error(validation.message);

      setImportMessage('Parsing des tweets...');
      const archiveData = await parseTwitterArchive(arrayBuffer);
      if (archiveData.totalTweets === 0) throw new Error('Aucun tweet trouvé dans l\'archive.');

      setArchiveData(archiveData);
      setArchiveSource('imported');
      setImportStatus('success');
      setImportMessage(`Archive importée ! ${archiveData.totalTweets.toLocaleString()} tweets chargés.`);
      setTimeout(() => { setImportStatus('idle'); setImportMessage(''); router.back(); }, 2000);
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  // ── Traitement natif (fileUri direct → archiveParser) ────────────────────────
  const processFileUri = async (fileUri: string) => {
    try {
      setImportMessage('Validation de l\'archive...');
      const validation = await validateTwitterArchive(fileUri);
      if (!validation.valid) throw new Error(validation.message);

      setImportMessage('Lecture des tweets...');
      // parseTwitterArchive reçoit le fileUri et lit le ZIP en place
      // via react-native-blob-util (RandomAccessFile natif) — sans OOM
      const archiveData = await parseTwitterArchive(fileUri);
      if (archiveData.totalTweets === 0) throw new Error('Aucun tweet trouvé dans l\'archive.');

      setArchiveData(archiveData);
      setArchiveSource('imported');
      setImportStatus('success');
      setImportMessage(`Archive importée ! ${archiveData.totalTweets.toLocaleString()} tweets chargés.`);
      setTimeout(() => { setImportStatus('idle'); setImportMessage(''); router.back(); }, 2000);
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  // ── Demande de permission Android ────────────────────────────────────────────
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      // Android 13+ (API 33+) : pas de permission READ_EXTERNAL_STORAGE
      // pour les fichiers sélectionnés via DocumentPicker — accès direct.
      // Android 12 et inférieur : demander READ_EXTERNAL_STORAGE.
      const sdkVersion = Platform.Version as number;
      if (sdkVersion >= 33) return true;

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Accès aux fichiers',
          message:
            'Twarex a besoin d\'accéder à vos fichiers pour importer votre archive Twitter.',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Refuser',
          buttonPositive: 'Autoriser',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return true; // En cas d'erreur, on laisse le système gérer
    }
  };

  // ── Handler principal ─────────────────────────────────────────────────────────
  const handleImportArchive = async () => {

    // Web : FileReader → ArrayBuffer
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', '.zip,application/zip,application/x-zip-compressed');
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        setImportStatus('loading');
        setImportMessage('Lecture du fichier...');
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            if (arrayBuffer) {
              await processArrayBuffer(arrayBuffer);
            } else {
              setImportStatus('error');
              setImportMessage('Impossible de lire le fichier.');
            }
          };
          reader.onerror = () => { setImportStatus('error'); setImportMessage('Erreur de lecture.'); };
          reader.readAsArrayBuffer(file);
        } catch (err) {
          setImportStatus('error');
          setImportMessage(err instanceof Error ? err.message : 'Erreur de sélection');
        }
      };
      input.click();
      return;
    }

    // Natif Android/iOS
    setImportStatus('loading');
    setImportMessage('Vérification des permissions...');

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setImportStatus('error');
      setImportMessage('Permission d\'accès aux fichiers refusée.');
      return;
    }

    try {
      setImportMessage('Sélection du fichier...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/zip', 'application/x-zip-compressed', '*/*'],
        copyToCacheDirectory: false, // Pas de copie — on lit le ZIP en place
      });

      if (result.canceled) {
        setImportStatus('idle');
        setImportMessage('');
        return;
      }

      const fileUri = result.assets[0].uri;
      // On passe directement l'URI au parser — pas de readAsStringAsync
      await processFileUri(fileUri);

    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'Erreur lors de la sélection');
    }
  };

  const handleResetToMockData = () => {
    Alert.alert(
      'Réinitialiser',
      'Remplacer l\'archive actuelle par les données d\'exemple ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          onPress: () => {
            setArchiveData(mockTwitterArchive);
            setArchiveSource('mock');
            Alert.alert('Réinitialisé', 'Données d\'exemple chargées.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteArchive = () => {
    Alert.alert(
      'Supprimer l\'archive',
      'Cela supprimera les données importées de l\'app. Le fichier ZIP original ne sera pas touché.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              setArchiveData(mockTwitterArchive);
              setArchiveSource('mock');
              Alert.alert('Archive supprimée', 'Les données ont été effacées de l\'app.');
            } catch {
              Alert.alert('Erreur', 'Problème lors de la suppression.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Archive Settings',
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
                  colors.error,
              },
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
                  <Text style={[styles.statusText, { color: colors.error }]}>Erreur : {importMessage}</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.importButton,
              { backgroundColor: colors.primary },
              importStatus === 'loading' && { opacity: 0.7 },
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
