import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, Platform } from 'react-native';
import { Play, Calendar } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { usePrivacyStore } from '@/store/privacyStore';

interface MediaItem {
  url: string;
  type: 'photo' | 'video';
  tweetId: string;
  date: string;
}

interface MediaGridProps {
  mediaItems: MediaItem[];
  onMediaPress: (tweetId: string) => void;
  searchQuery?: string;
  hasActiveFilters?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

const MediaGrid = ({ 
  mediaItems, 
  onMediaPress,
  searchQuery = '',
  hasActiveFilters = false,
  startDate = null,
  endDate = null
}: MediaGridProps) => {
  const { colors } = useThemeStore();
  const { networkAccessBlocked } = usePrivacyStore();
  const screenWidth = Dimensions.get('window').width;
  const numColumns = Math.floor(screenWidth / 150); // Adjust based on screen width
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
  // Determine if we should show images based on privacy settings
  const shouldShowImages = !networkAccessBlocked || Platform.OS === 'web';
  
  // Render a media item
  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    return (
      <TouchableOpacity
        style={[styles.mediaItem, { backgroundColor: colors.card }]}
        onPress={() => onMediaPress(item.tweetId)}
        activeOpacity={0.7}
      >
        {shouldShowImages ? (
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: item.url }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
            {item.type === 'video' && (
              <View style={[styles.videoIndicator, { backgroundColor: colors.primary }]}>
                <Play size={12} color={colors.white} />
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.mediaPlaceholder, { backgroundColor: colors.primaryLight }]}>
            {item.type === 'photo' ? (
              <Text style={[styles.mediaPlaceholderText, { color: colors.primary }]}>Photo</Text>
            ) : (
              <View style={styles.videoPlaceholder}>
                <Play size={24} color={colors.primary} />
                <Text style={[styles.mediaPlaceholderText, { color: colors.primary }]}>Video</Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[styles.mediaInfo, { backgroundColor: colors.card }]}>
          <View style={styles.dateContainer}>
            <Calendar size={12} color={colors.textSecondary} style={styles.dateIcon} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        {(searchQuery.trim() || hasActiveFilters) ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No media found matching your search criteria
          </Text>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {networkAccessBlocked 
              ? "Media preview is disabled in privacy mode" 
              : "No media found in your archive"}
          </Text>
        )}
      </View>
    );
  };
  
  // Render header with count
  const renderHeader = () => {
    if (mediaItems.length === 0) return null;
    
    return (
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          {mediaItems.length} {mediaItems.length === 1 ? 'media item' : 'media items'}
        </Text>
        {hasActiveFilters && (
          <Text style={[styles.dateRangeText, { color: colors.textSecondary }]}>
            {startDate ? new Date(startDate).toLocaleDateString() : 'Any date'} 
            {' - '} 
            {endDate ? new Date(endDate).toLocaleDateString() : 'Any date'}
          </Text>
        )}
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={mediaItems}
        renderItem={renderMediaItem}
        keyExtractor={(item, index) => `${item.tweetId}-${index}`}
        numColumns={numColumns}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    padding: 8,
    flexGrow: 1,
  },
  mediaItem: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mediaContainer: {
    aspectRatio: 1,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholder: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    padding: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateRangeText: {
    fontSize: 14,
  },
});

export default MediaGrid;