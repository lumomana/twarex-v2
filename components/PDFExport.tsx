import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Printer, Download, Eye, EyeOff, FileText, Share2 } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useArchiveStore } from '@/store/archiveStore';
import { usePrivacyStore } from '@/store/privacyStore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Tweet } from '@/types/twitter';

interface PDFExportProps {
  onClose: () => void;
}

export default function PDFExport({ onClose }: PDFExportProps) {
  const { colors } = useThemeStore();
  const { archiveData } = useArchiveStore();
  const { networkAccessBlocked } = usePrivacyStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [includeMedia, setIncludeMedia] = useState(!networkAccessBlocked);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Generate HTML for a single tweet
  const generateTweetHtml = (tweet: Tweet) => {
    const hasMedia = tweet.media && tweet.media.length > 0 && includeMedia;
    const tweetUrl = `https://x.com/${tweet.user.screen_name}/status/${tweet.id}`;
    
    return `
      <div style="border-bottom: 1px solid #E1E8ED; padding: 16px; margin-bottom: 8px;">
        <div style="display: flex; margin-bottom: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 24px; background-color: #F5F8FA; margin-right: 12px; overflow: hidden; display: flex; justify-content: center; align-items: center;">
            ${includeMedia 
              ? `<img src="${tweet.user.profile_image_url}" style="width: 48px; height: 48px;" alt="${tweet.user.name}" />`
              : `<div style="font-size: 20px; font-weight: bold; color: #1DA1F2;">${tweet.user.name.charAt(0).toUpperCase()}</div>`
            }
          </div>
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 16px;">${tweet.user.name}</div>
            <div style="color: #657786; font-size: 14px;">@${tweet.user.screen_name}</div>
          </div>
          <div style="color: #657786; font-size: 14px;">${formatDate(tweet.created_at)}</div>
        </div>
        
        <div style="font-size: 16px; line-height: 1.4; margin-bottom: 12px;">
          ${tweet.text}
        </div>
        
        ${hasMedia && tweet.media ? `
          <div style="margin-bottom: 12px; border-radius: 12px; overflow: hidden;">
            <img src="${tweet.media[0].url}" style="width: 100%; max-height: 300px; object-fit: cover;" alt="Tweet media" />
          </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; color: #657786;">
          <div>Retweets: ${tweet.retweet_count}</div>
          <div>Likes: ${tweet.favorite_count}</div>
        </div>
        
        <div style="margin-top: 8px; font-size: 12px; color: #657786; font-family: monospace;">
          <a href="${tweetUrl}" style="color: #1DA1F2; text-decoration: none;">${tweetUrl}</a>
        </div>
      </div>
    `;
  };
  
  // Generate HTML for the entire PDF
  const generatePdfHtml = () => {
    const tweets = getAllTweets();
    const tweetsHtml = tweets.map(tweet => generateTweetHtml(tweet)).join('');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Twitter Archive</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #14171A;
              background-color: #F1E2BE;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #1DA1F2;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 16px;
              color: #657786;
              margin-bottom: 16px;
            }
            .stats {
              display: flex;
              justify-content: space-around;
              margin-bottom: 20px;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 20px;
              font-weight: bold;
              color: #1DA1F2;
            }
            .stat-label {
              font-size: 14px;
              color: #657786;
            }
            .chronology-note {
              text-align: center;
              font-style: italic;
              color: #657786;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #657786;
              padding-top: 20px;
              border-top: 1px solid #E1E8ED;
            }
            @media print {
              .container {
                width: 100%;
                max-width: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">Twitter Archive</div>
              <div class="subtitle">@${tweets[0]?.user.screen_name || 'elenamoreno'}'s Twitter Archive</div>
              <div class="subtitle">Generated on ${new Date().toLocaleDateString()}</div>
              
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${tweets.length}</div>
                  <div class="stat-label">Tweets</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${archiveData.years.length}</div>
                  <div class="stat-label">Years</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${includeMedia ? 'Yes' : 'No'}</div>
                  <div class="stat-label">Media Included</div>
                </div>
              </div>
              
              <div class="chronology-note">
                Tweets are displayed in chronological order, starting with your first tweet.
              </div>
            </div>
            
            <div class="tweets">
              ${tweetsHtml}
            </div>
            
            <div class="footer">
              <p>This archive was exported in ${includeMedia ? 'online' : 'offline'} mode.</p>
              <p>Privacy protected: ${networkAccessBlocked ? 'Yes' : 'No'}</p>
              <p>Export date: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
  // Generate preview HTML
  useEffect(() => {
    const generatePreview = async () => {
      setIsPreviewReady(false);
      const html = generatePdfHtml();
      setPreviewHtml(html);
      setIsPreviewReady(true);
    };
    
    generatePreview();
  }, [includeMedia]);
  
  // Generate and share PDF
  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Generate HTML
      const html = generatePdfHtml();
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      // On web, we can just print
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        setIsGenerating(false);
        return;
      }
      
      // On mobile, we can share the file
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Create a more user-friendly filename
        const pdfName = `TwitterArchive_${new Date().toISOString().split('T')[0]}.pdf`;
        const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;
        
        // Copy the file to a location with a better name
        await FileSystem.copyAsync({
          from: uri,
          to: pdfPath
        });
        
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(pdfPath);
        }
      }
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
    }
  };
  
  // Toggle media inclusion
  const toggleMediaInclusion = () => {
    // If network access is blocked, we can't include media
    if (networkAccessBlocked && !includeMedia) {
      return;
    }
    
    setIncludeMedia(!includeMedia);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Export Archive</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Preview and export your Twitter archive as PDF
        </Text>
      </View>
      
      <View style={[styles.optionsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.optionRow}>
          <View style={styles.optionLabelContainer}>
            <FileText size={20} color={colors.primary} style={styles.optionIcon} />
            <Text style={[styles.optionLabel, { color: colors.text }]}>Include Media</Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              { 
                backgroundColor: includeMedia ? colors.primaryLight : colors.lightGray,
                opacity: networkAccessBlocked ? 0.5 : 1
              }
            ]}
            onPress={toggleMediaInclusion}
            disabled={networkAccessBlocked}
          >
            {includeMedia ? (
              <Eye size={20} color={colors.primary} />
            ) : (
              <EyeOff size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        
        {networkAccessBlocked && (
          <Text style={[styles.warningText, { color: colors.error }]}>
            Media inclusion is disabled when network access is blocked
          </Text>
        )}
        
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Tweets will be displayed in chronological order, starting with your first tweet.
        </Text>
      </View>
      
      <View style={styles.previewContainer}>
        <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
        
        {!isPreviewReady ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Generating preview...
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={[styles.previewScroll, { backgroundColor: colors.card }]}
            contentContainerStyle={styles.previewContent}
          >
            {Platform.OS === 'web' ? (
              <View style={styles.webPreviewContainer}>
                <div 
                  style={{ 
                    width: '100%', 
                    height: '400px', 
                    overflow: 'auto',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    backgroundColor: '#F1E2BE'
                  }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </View>
            ) : (
              <View style={styles.nativePreviewContainer}>
                <Text style={[styles.previewText, { color: colors.text }]}>
                  PDF Preview not available on this platform. Tap 'Generate PDF' to create your file.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
      
      <View style={[styles.actionsContainer, { backgroundColor: colors.headerBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton, { borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.actionButtonText, { color: colors.white }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.exportButton, 
            { backgroundColor: colors.primary },
            isGenerating && { opacity: 0.7 }
          ]}
          onPress={generatePDF}
          disabled={isGenerating || !isPreviewReady}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Download size={18} color={colors.white} style={styles.actionButtonIcon} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>Export PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  optionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  previewScroll: {
    flex: 1,
    borderRadius: 8,
  },
  previewContent: {
    padding: 8,
  },
  webPreviewContainer: {
    width: '100%',
    height: 400,
  },
  nativePreviewContainer: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewText: {
    fontSize: 14,
    textAlign: 'center',
  },
  printPreview: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  exportButton: {
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonIcon: {
    marginRight: 8,
  },
});