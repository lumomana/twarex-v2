import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';

const { width: screenWidth } = Dimensions.get('window');

export default function TimeDistributionChart() {
  const { archiveData } = useArchiveStore();
  const { colors } = useThemeStore();
  
  // Initialize hours array with zeros
  const hourCounts = Array(24).fill(0);
  
  // Count tweets by hour
  archiveData.years.forEach(year => {
    year.months.forEach(month => {
      month.days.forEach(day => {
        day.tweets.forEach(tweet => {
          const date = new Date(tweet.created_at);
          const hour = date.getHours();
          hourCounts[hour]++;
        });
      });
    });
  });
  
  // Find maximum count for scaling
  const maxCount = Math.max(...hourCounts);
  
  // Calculate bar width based on screen size
  const barWidth = Math.min(12, (screenWidth - 80) / 24 - 2);
  
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
          {hourCounts.map((count, hour) => {
            const barHeight = (count / maxCount) * 150;
            
            return (
              <View key={hour} style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight, 
                      width: barWidth,
                      backgroundColor: hour >= 6 && hour < 18 ? colors.accent : colors.primary 
                    }
                  ]} 
                />
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                  {hour}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Day (6am-6pm)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Night (6pm-6am)</Text>
        </View>
      </View>
      
      {/* X-axis label */}
      <Text style={[styles.xAxisLabel, { color: colors.textSecondary }]}>Hour of Day (24h)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 230,
    flexDirection: 'row',
    marginTop: 16,
  },
  yAxis: {
    width: 40,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    height: 150,
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
    height: 150,
  },
  barWrapper: {
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  barLabel: {
    fontSize: 8,
    marginTop: 4,
    transform: [{ rotate: '45deg' }],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 0,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
  },
  xAxisLabel: {
    textAlign: 'center',
    fontSize: 10,
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
  },
});