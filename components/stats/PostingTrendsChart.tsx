import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';

const { width: screenWidth } = Dimensions.get('window');

export default function PostingTrendsChart() {
  const { archiveData } = useArchiveStore();
  const { colors } = useThemeStore();
  
  // Extract yearly data
  const yearlyData = archiveData.years.map(year => ({
    year: year.year,
    count: year.tweetCount
  }));
  
  // Find the maximum tweet count for scaling
  const maxCount = Math.max(...yearlyData.map(item => item.count));
  
  // Calculate bar width based on number of years
  const barWidth = Math.min(40, (screenWidth - 64) / yearlyData.length - 8);
  
  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>{maxCount}</Text>
        <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>{Math.round(maxCount / 2)}</Text>
        <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>0</Text>
      </View>
      
      {/* Chart area */}
      <View style={styles.chartArea}>
        {/* Horizontal grid lines */}
        <View style={[styles.gridLine, { top: 0, borderTopColor: colors.border }]} />
        <View style={[styles.gridLine, { top: '50%', borderTopColor: colors.border }]} />
        <View style={[styles.gridLine, { bottom: 0, borderTopColor: colors.border }]} />
        
        {/* Bars */}
        <View style={styles.barsContainer}>
          {yearlyData.map((item, index) => {
            const barHeight = (item.count / maxCount) * 200;
            
            return (
              <View key={item.year} style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight, 
                      width: barWidth,
                      backgroundColor: colors.primary 
                    }
                  ]} 
                />
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{item.year}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    flexDirection: 'row',
    marginTop: 16,
  },
  yAxis: {
    width: 40,
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    height: 200,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
  },
  barWrapper: {
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});