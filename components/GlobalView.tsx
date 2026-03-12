import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import HierarchicalBarChart from './HierarchicalBarChart';

export default function GlobalView() {
  const { archiveData } = useArchiveStore();
  const { colors } = useThemeStore();
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.statsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{archiveData.totalTweets}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Tweets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{archiveData.years.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Years</Text>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tweet Timeline</Text>
      <View style={styles.chartContainer}>
        <HierarchicalBarChart />
      </View>
      
      <Text style={[styles.instructions, { color: colors.textSecondary }]}>
        Tap on bars to explore different time periods. Tap outside to go back.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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