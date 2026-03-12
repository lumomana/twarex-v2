import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import HierarchicalBarChart from './HierarchicalBarChart';

export default function YearView() {
  const { getCurrentYearData } = useArchiveStore();
  const { colors } = useThemeStore();
  
  const yearData = getCurrentYearData();
  
  if (!yearData) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No year data available</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.statsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{yearData.tweetCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tweets in {yearData.year}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {Math.round(yearData.tweetCount / 12)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg per Month</Text>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tweet Timeline for {yearData.year}</Text>
      <View style={styles.chartContainer}>
        <HierarchicalBarChart />
      </View>
      
      <Text style={[styles.instructions, { color: colors.textSecondary }]}>
        Tap on bars to explore months. Tap outside to go back to all years.
      </Text>
    </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  chartContainer: {
    height: 400,
    marginHorizontal: 16,
  },
  instructions: {
    fontSize: 14,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
});