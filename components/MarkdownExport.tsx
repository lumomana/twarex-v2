import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Download, FileText } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useArchiveStore } from '@/store/archiveStore';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Tweet } from '@/types/twitter';

interface MarkdownExportProps {
  onClose: () => void;
}

export default function MarkdownExport({ onClose }: MarkdownExportProps) {
  const { colors } = useThemeStore();
  const { archiveData } = useArchiveStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Collect all tweets in chronological order (oldest first)
  const getAllTweets = (): Tweet[] => {
    const allTweets: Tweet[] = [];

    archiveData.years.forEach(year => {
      year.months.forEach(month => {
        month.days.forEach(day => {
          day.tweets.forEach(tweet => {
            allTweets.push(tweet);
          });
        });
      });
    });

    // Sort by date (oldest first)
    return allTweets.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate Markdown for a single tweet
  const generateTweetMarkdown = (tweet: Tweet, index: number) => {
    const tweetUrl = `https://x.com/${tweet.user.screen_name}/status/${tweet.id}`;

    let markdown = `## Tweet ${index + 1}\n\n`;
    markdown += `**${tweet.user.name}** (@${tweet.user.screen_name})\n\n`;
    markdown += `${tweet.text}\n\n`;
    markdown += `📅 ${formatDate(tweet.created_at)}\n\n`;
    markdown += `❤️ ${tweet.favorite_count} | 🔄 ${tweet.retweet_count}\n\n`;

    if (tweet.media && tweet.media.length > 0) {
      markdown += `**Media:**\n`;
      tweet.media.forEach((m, i) => {
        markdown += `- [${m.type} ${i + 1}](${m.url})\n`;
      });
      markdown += '\n';
    }

    markdown += `[Voir sur X](${tweetUrl})\n\n`;
    markdown += `---\n\n`;

    return markdown;
  };

  // Generate complete Markdown content
  const generateMarkdownContent = () => {
    const tweets = getAllTweets();
    const screenName = tweets[0]?.user.screen_name || 'utilisateur';
    const userName = tweets[0]?.user.name || 'Utilisateur';

    let markdown = `# Export d'Archive Twitter\n\n`;
    markdown += `**Utilisateur:** ${userName} (@${screenName})\n\n`;
    markdown += `**Généré le:** ${new Date().toLocaleString('fr-FR')}\n\n`;
    markdown += `**Total de Tweets:** ${tweets.length}\n\n`;
    markdown += `**Période:** ${archiveData.years.length} année(s)\n\n`;

    markdown += `---\n\n`;

    // Add tweets
    tweets.forEach((tweet, index) => {
      markdown += generateTweetMarkdown(tweet, index);
    });

    // Add footer
    markdown += `## Informations d'Exportation\n\n`;
    markdown += `- Total de tweets exportés : ${tweets.length}\n`;
    markdown += `- Date d'exportation : ${new Date().toLocaleString('fr-FR')}\n`;
    markdown += `- Format : Markdown (.md) UTF-8\n`;

    return markdown;
  };

  // Generate and share Markdown file
  const generateAndShareMarkdown = async () => {
    try {
      setIsGenerating(true);

      // Generate Markdown content
      const markdownContent = generateMarkdownContent();

      if (Platform.OS === 'web') {
        // On web, create a download link with explicit UTF-8 BOM for some editors
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const element = document.createElement('a');
        element.href = url;
        element.download = `ArchiveTwitter_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
        
        setIsGenerating(false);
        return;
      }

      // On mobile (iOS/Android)
      const mdFileName = `ArchiveTwitter_${new Date().toISOString().split('T')[0]}.md`;
      const mdPath = `${FileSystem.documentDirectory}${mdFileName}`;

      // Write file with UTF-8 encoding
      await FileSystem.writeAsStringAsync(mdPath, markdownContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(mdPath, {
          mimeType: 'text/markdown',
          dialogTitle: 'Exporter l\'Archive Twitter',
        });
      } else {
        Alert.alert('Succès', `Fichier enregistré dans : ${mdPath}`);
      }

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating Markdown:', error);
      Alert.alert('Erreur', `Échec de la génération du fichier Markdown : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setIsGenerating(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Exporter en Markdown</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Exportez votre archive Twitter dans un fichier Markdown simple (UTF-8)
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FileText size={24} color={colors.text} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Votre archive sera exportée sous forme de fichier .md avec tous les tweets par ordre chronologique.
          </Text>
        </View>

        <View style={[styles.statsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {archiveData.totalTweets}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Tweets
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {archiveData.years.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Années
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={generateAndShareMarkdown}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Download size={20} color={colors.background} />
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Exporter en Markdown
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={onClose}
          disabled={isGenerating}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Annuler
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  statsBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  button: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
