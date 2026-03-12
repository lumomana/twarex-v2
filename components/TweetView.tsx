import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { ArrowLeft, ArrowRight, Copy, ExternalLink } from 'lucide-react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import TweetItem from './TweetItem';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { usePrivacyStore } from '@/store/privacyStore';

export default function TweetView() {
  const { 
    getCurrentTweet, 
    getCurrentDayData,
    navigateToPreviousTweet, 
    navigateToNextTweet,
    hasPreviousTweet,
    hasNextTweet
  } = useArchiveStore();
  
  const { colors } = useThemeStore();
  const { networkAccessBlocked } = usePrivacyStore();
  
  const tweet = getCurrentTweet();
  const dayData = getCurrentDayData();
  
  if (!tweet) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tweet not found</Text>
      </View>
    );
  }
  
  // Find the current tweet index
  const tweetIndex = dayData?.tweets.findIndex(t => t.id === tweet.id) ?? -1;
  const totalTweets = dayData?.tweets.length ?? 0;
  
  const canGoToPrevious = hasPreviousTweet();
  const canGoToNext = hasNextTweet();
  
  // Generate the tweet URL (using x.com instead of twitter.com for the current format)
  const tweetUrl = `https://x.com/${tweet.user.screen_name}/status/${tweet.id}`;
  
  // Copy URL to clipboard
  const copyUrlToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(tweetUrl);
      // You could add a toast or some visual feedback here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  
  // Open tweet in browser
  const openTweetInBrowser = async () => {
    if (networkAccessBlocked) {
      // Show an alert or message that network access is blocked
      return;
    }
    
    try {
      await WebBrowser.openBrowserAsync(tweetUrl);
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer}>
        <TweetItem tweet={tweet} />
        
        <View style={[styles.metadataContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.metadataTitle, { color: colors.text }]}>Tweet Metadata</Text>
          
          <View style={[styles.metadataItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Tweet URL</Text>
            <View style={styles.urlContainer}>
              <TextInput
                style={[styles.metadataValue, styles.urlText, { color: colors.text }]}
                value={tweetUrl}
                editable={false}
                selectTextOnFocus={true}
              />
              <View style={styles.urlActions}>
                <TouchableOpacity 
                  style={[styles.urlButton, { backgroundColor: colors.primaryLight }]} 
                  onPress={copyUrlToClipboard}
                >
                  <Copy size={14} color={colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.urlButton, 
                    { 
                      backgroundColor: networkAccessBlocked ? colors.lightGray : colors.primaryLight,
                      opacity: networkAccessBlocked ? 0.5 : 1
                    }
                  ]} 
                  onPress={openTweetInBrowser}
                  disabled={networkAccessBlocked}
                >
                  <ExternalLink size={14} color={networkAccessBlocked ? colors.textSecondary : colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={[styles.metadataItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Created At</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>{new Date(tweet.created_at).toLocaleString()}</Text>
          </View>
          
          <View style={[styles.metadataItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Favorites</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>{tweet.favorite_count}</Text>
          </View>
          
          <View style={[styles.metadataItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Retweets</Text>
            <Text style={[styles.metadataValue, { color: colors.text }]}>{tweet.retweet_count}</Text>
          </View>
          
          {tweet.media && tweet.media.length > 0 && (
            <View style={[styles.metadataItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>Media</Text>
              <Text style={[styles.metadataValue, { color: colors.text }]}>{tweet.media.length} {tweet.media.length === 1 ? 'item' : 'items'}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Tweet navigation */}
      <View style={[styles.navigationContainer, { backgroundColor: colors.headerBackground, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.navigationButton, 
            { backgroundColor: canGoToPrevious ? colors.primary : colors.lightGray }
          ]}
          onPress={navigateToPreviousTweet}
          disabled={!canGoToPrevious}
        >
          <ArrowLeft size={16} color={canGoToPrevious ? colors.white : colors.border} />
          <Text style={[
            styles.navigationButtonText,
            { color: canGoToPrevious ? colors.white : colors.textSecondary }
          ]}>Previous Tweet</Text>
        </TouchableOpacity>
        
        <Text style={[styles.tweetCounter, { color: colors.white }]}>
          {tweetIndex + 1} of {totalTweets}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.navigationButton, 
            { backgroundColor: canGoToNext ? colors.primary : colors.lightGray }
          ]}
          onPress={navigateToNextTweet}
          disabled={!canGoToNext}
        >
          <Text style={[
            styles.navigationButtonText,
            { color: canGoToNext ? colors.white : colors.textSecondary }
          ]}>Next Tweet</Text>
          <ArrowRight size={16} color={canGoToNext ? colors.white : colors.border} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
  },
  metadataContainer: {
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  metadataTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  metadataLabel: {
    fontSize: 14,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
  urlText: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 12,
    flex: 1,
    paddingVertical: 0,
  },
  urlActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  urlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  navigationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  tweetCounter: {
    fontSize: 12,
  },
});