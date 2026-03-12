import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';

interface TimelineBarProps {
  data: Array<{
    id: string;
    label: string;
    count: number;
  }>;
  maxCount: number;
  onItemPress: (id: string) => void;
  selectedId?: string | null;
}

export default function TimelineBar({ data, maxCount, onItemPress, selectedId }: TimelineBarProps) {
  const getBarHeight = (count: number) => {
    if (maxCount === 0) return 0;
    const minHeight = 4;
    const maxHeight = 80;
    return Math.max(minHeight, (count / maxCount) * maxHeight);
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {data.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          style={[
            styles.barContainer,
            selectedId === item.id && styles.selectedBarContainer
          ]}
          onPress={() => onItemPress(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.barLabel}>{item.label}</Text>
          <View style={styles.barWrapper}>
            <View 
              style={[
                styles.bar, 
                { height: getBarHeight(item.count) },
                selectedId === item.id && styles.selectedBar
              ]} 
            />
          </View>
          <Text style={styles.countLabel}>{item.count}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    alignItems: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedBarContainer: {
    backgroundColor: colors.primaryLight,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
    marginVertical: 8,
  },
  bar: {
    width: 20,
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  selectedBar: {
    backgroundColor: colors.primary,
  },
  barLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  countLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});