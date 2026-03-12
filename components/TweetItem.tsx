import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Heart, Repeat, MessageCircle, Share, Image as ImageIcon, Play } from 'lucide-react-native';
import { Tweet } from '@/types/twitter';
import { useThemeStore } from '@/store/themeStore';
import { usePrivacyStore } from '@/store/privacyStore';

interface TweetItemProps {
  tweet: Tweet;
  onPress?: () => void;
  compact?: boolean;
  highlightText?: string;
}

export default function TweetItem({ tweet, onPress, compact = false, highlightText = '' }: TweetItemProps) {
  const { colors } = useThemeStore();
  const { networkAccessBlocked } = usePrivacyStore();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to highlight search text in tweet
  const renderHighlightedText = () => {
    if (!highlightText) {
      return <Text style={[styles.tweetText, { color: colors.text }]}>{tweet.text}</Text>;
    }

    const parts = tweet.text.split(new RegExp(`(${highlightText})`, 'gi'));
    
    return (
      <Text style={[styles.tweetText, { color: colors.text }]}>
        {parts.map((part, i) => 
          part.toLowerCase() === highlightText.toLowerCase() ? (
            <Text 
              key={i} 
              style={[
                styles.highlightedText, 
                { 
                  backgroundColor: colors.primaryLight,
                  color: colors.primary
                }
              ]}
            >
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  // Determine if we should show images based on privacy settings
  const shouldShowImages = !networkAccessBlocked || Platform.OS === 'web';

  // Render media content
  const renderMedia = () => {
    if (!tweet.media || tweet.media.length === 0 || compact) return null;
    
    if (shouldShowImages) {
      return (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: tweet.media[0].url }} 
            style={[styles.media, { backgroundColor: colors.lightGray }]} 
            resizeMode="cover"
          />
          {tweet.media[0].type === 'video' && (
            <View style={[styles.videoIndicator, { backgroundColor: colors.primary }]}>
              <Play size={16} color={colors.white} />
            </View>
          )}
          {tweet.media.length > 1 && (
            <View style={[styles.multipleMediaIndicator, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.multipleMediaText, { color: colors.primary }]}>
                +{tweet.media.length - 1}
              </Text>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View style={[styles.mediaPlaceholder, { backgroundColor: colors.primaryLight }]}>
          <View style={styles.mediaPlaceholderContent}>
            {tweet.media[0].type === 'photo' ? (
              <ImageIcon size={24} color={colors.primary} />
            ) : (
              <Play size={24} color={colors.primary} />
            )}
            <Text style={[styles.mediaPlaceholderText, { color: colors.primary }]}>
              {tweet.media.length} {tweet.media.length === 1 ? 'media item' : 'media items'}
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        compact && styles.compactContainer,
        { backgroundColor: colors.card, borderBottomColor: colors.border }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {shouldShowImages ? (
          <Image source={{ uri: tweet.user.profile_image_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarInitial, { color: colors.primary }]}>
              {tweet.user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{tweet.user.name}</Text>
          <Text style={[styles.userHandle, { color: colors.textSecondary }]}>@{tweet.user.screen_name}</Text>
          {tweet.user.bio && !compact && (
            <Text style={[styles.userBio, { color: colors.textSecondary }]} numberOfLines={1}>
              {tweet.user.bio}
            </Text>
          )}
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDate(tweet.created_at)}</Text>
      </View>
      
      {renderHighlightedText()}
      
      {renderMedia()}
      
      {!compact && (
        <View style={styles.actions}>
          <View style={styles.actionItem}>
            <MessageCircle size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>0</Text>
          </View>
          <View style={styles.actionItem}>
            <Repeat size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{tweet.retweet_count}</Text>
          </View>
          <View style={styles.actionItem}>
            <Heart size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{tweet.favorite_count}</Text>
          </View>
          <View style={styles.actionItem}>
            <Share size={16} color={colors.textSecondary} />
          </View>
        </View>
      )}
      
      {/* Show media indicator in compact mode */}
      {compact && tweet.media && tweet.media.length > 0 && (
        <View style={[styles.compactMediaIndicator, { backgroundColor: colors.primaryLight }]}>
          {tweet.media[0].type === 'photo' ? (
            <ImageIcon size={12} color={colors.primary} />
          ) : (
            <Play size={12} color={colors.primary} />
          )}
          <Text style={[styles.compactMediaText, { color: colors.primary }]}>
            {tweet.media.length}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
  },
  compactContainer: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
  },
  userHandle: {
    fontSize: 14,
  },
  userBio: {
    fontSize: 12,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
  },
  tweetText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  highlightedText: {
    fontWeight: '600',
    borderRadius: 2,
    paddingHorizontal: 2,
  },
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: 200,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multipleMediaIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  multipleMediaText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  mediaPlaceholder: {
    marginBottom: 12,
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholderContent: {
    alignItems: 'center',
  },
  mediaPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 13,
  },
  compactMediaIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  compactMediaText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});