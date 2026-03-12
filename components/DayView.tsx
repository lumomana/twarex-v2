import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import TweetItem from './TweetItem';

export default function DayView() {
  const { getCurrentDayData, selectTweet } = useArchiveStore();
  const { colors } = useThemeStore();
  
  const dayData = getCurrentDayData();
  
  if (!dayData) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No day data available</Text>
      </View>
    );
  }
  
  if (dayData.tweets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tweets on this day</Text>
      </View>
    );
  }
  
  const date = new Date(dayData.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.dateTitle, { color: colors.text }]}>{formattedDate}</Text>
        <Text style={[styles.tweetCount, { color: colors.textSecondary }]}>{dayData.tweetCount} tweets</Text>
      </View>
      
      <FlatList
        data={dayData.tweets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TweetItem 
            tweet={item} 
            onPress={() => selectTweet(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tweetCount: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
});