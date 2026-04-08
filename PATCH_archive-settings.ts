/**
 * PATCH pour app/archive-settings.tsx
 * ────────────────────────────────────
 * Remplace l'ancienne fonction handleImportArchive (qui utilisait mockTwitterArchive)
 * par cette implémentation réelle.
 *
 * IMPORTS À AJOUTER en haut du fichier :
 *
 *   import * as DocumentPicker from 'expo-document-picker';
 *   import {
 *     parseTwitterArchive,
 *     validateTwitterArchiveZip,
 *     type ParseProgress,
 *   } from '@/utils/archiveParser';
 *
 * ÉTAT À AJOUTER dans le composant :
 *
 *   const [importProgress, setImportProgress] = useState<ParseProgress | null>(null);
 *   const [importError, setImportError] = useState<string | null>(null);
 *
 * REMPLACER l'ancienne handleImportArchive par :
 */

const handleImportArchive = async () => {
  setImportError(null);
  setImportProgress(null);

  // 1. Sélection du fichier
  let pickerResult;
  try {
    pickerResult = await DocumentPicker.getDocumentAsync({
      type: 'application/zip',
      copyToCacheDirectory: true, // Nécessaire pour pouvoir lire le fichier
    });
  } catch (err) {
    setImportError("Impossible d'ouvrir le sélecteur de fichiers.");
    return;
  }

  if (pickerResult.canceled || !pickerResult.assets?.[0]) {
    return; // L'utilisateur a annulé
  }

  const file = pickerResult.assets[0];
  const fileUri = file.uri;

  // 2. Validation rapide
  setImportProgress({ step: 'Vérification du fichier…', progress: 2 });
  const validation = await validateTwitterArchiveZip(fileUri);
  if (!validation.valid) {
    setImportError(validation.reason ?? 'Fichier invalide.');
    setImportProgress(null);
    return;
  }

  // 3. Parsing complet avec progression
  try {
    const archiveData = await parseTwitterArchive(fileUri, (progress) => {
      setImportProgress(progress);
    });

    // 4. Stockage dans le store Zustand
    setArchiveData(archiveData);
    setImportProgress(null);

    // 5. Feedback succès
    Alert.alert(
      '✅ Archive importée',
      `@${archiveData.user.username} — ${archiveData.stats.totalTweets.toLocaleString()} tweets chargés avec succès.`,
      [{ text: 'Super !', style: 'default' }]
    );
  } catch (err: unknown) {
    setImportProgress(null);
    const message =
      err instanceof Error ? err.message : "Erreur inconnue lors de l'import.";
    setImportError(message);
    Alert.alert('❌ Échec de l\'import', message, [
      { text: 'OK', style: 'cancel' },
    ]);
  }
};

/**
 * COMPOSANT DE PROGRESSION À AJOUTER dans le JSX (après le bouton d'import) :
 *
 * {importProgress && (
 *   <View style={{ marginTop: 16, padding: 12, backgroundColor: '#F1E2BE', borderRadius: 8 }}>
 *     <Text style={{ fontWeight: '600', marginBottom: 6 }}>{importProgress.step}</Text>
 *     <View style={{ height: 6, backgroundColor: '#E0D0A0', borderRadius: 3 }}>
 *       <View
 *         style={{
 *           height: 6,
 *           width: `${importProgress.progress}%`,
 *           backgroundColor: '#1DA1F2',
 *           borderRadius: 3,
 *         }}
 *       />
 *     </View>
 *     {importProgress.detail && (
 *       <Text style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
 *         {importProgress.detail}
 *       </Text>
 *     )}
 *   </View>
 * )}
 *
 * {importError && (
 *   <Text style={{ marginTop: 12, color: 'red', fontSize: 13 }}>
 *     ⚠️ {importError}
 *   </Text>
 * )}
 */
