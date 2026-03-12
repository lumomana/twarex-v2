import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';

export default function ActivityHeatmap() {
  const { archiveData } = useArchiveStore();
  const { colors } = useThemeStore();
  
  // Create a 7x24 grid for days of week and hours
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Initialize activity grid with zeros
  const activityGrid = Array(7).fill(0).map(() => Array(24).fill(0));
  
  // Populate activity grid
  let maxActivity = 0;
  
  archiveData.years.forEach(year => {
    year.months.forEach(month => {
      month.days.forEach(day => {
        day.tweets.forEach(tweet => {
          const date = new Date(tweet.created_at);
          const dayOfWeek = date.getDay();
          const hour = date.getHours();
          
          activityGrid[dayOfWeek][hour]++;
          maxActivity = Math.max(maxActivity, activityGrid[dayOfWeek][hour]);
        });
      });
    });
  });
  
  // Function to get color intensity based on activity - INVERTED
  const getColorIntensity = (count: any) => {
    if (count === 0) return colors.lightGray;
    
    // Invert the intensity calculation so higher activity = darker color
    const baseIntensity = Math.min(1, count / (maxActivity * 0.7));
    const invertedIntensity = 1 - baseIntensity * 0.8; // Keep a range from 0.2 to 1 for visibility
    
    // Create a color gradient from light to dark (inverted)
    const r = Math.round(parseInt(colors.primary.slice(1, 3), 16) * invertedIntensity);
    const g = Math.round(parseInt(colors.primary.slice(3, 5), 16) * invertedIntensity);
    const b = Math.round(parseInt(colors.primary.slice(5, 7), 16) * invertedIntensity);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.heatmapContainer}>
          {/* Hour labels */}
          <View style={styles.hourLabels}>
            <View style={styles.dayLabel} />
            {hours.map(hour => (
              <Text key={`hour-${hour}`} style={[styles.hourLabel, { color: colors.textSecondary }]}>
                {hour}
              </Text>
            ))}
          </View>
          
          {/* Heatmap grid */}
          {daysOfWeek.map((day, dayIndex) => (
            <View key={day} style={styles.dayRow}>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>{day}</Text>
              {hours.map(hour => (
                <View 
                  key={`${day}-${hour}`} 
                  style={[
                    styles.cell, 
                    { 
                      backgroundColor: getColorIntensity(activityGrid[dayIndex][hour]),
                      borderColor: colors.background
                    }
                  ]}
                >
                  {activityGrid[dayIndex][hour] > 0 && (
                    <Text style={[
                      styles.cellText, 
                      { color: activityGrid[dayIndex][hour] > maxActivity * 0.5 ? 'white' : '#A7D6CD' }
                    ]}>
                      {activityGrid[dayIndex][hour]}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>Less</Text>
        <View style={styles.legendGradient}>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
            <View 
              key={`legend-${i}`} 
              style={[
                styles.legendCell, 
                { backgroundColor: getColorIntensity(intensity * maxActivity) }
              ]} 
            />
          ))}
        </View>
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  heatmapContainer: {
    paddingBottom: 8,
  },
  hourLabels: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  hourLabel: {
    width: 20,
    fontSize: 8,
    textAlign: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'center',
  },
  dayLabel: {
    width: 30,
    fontSize: 10,
    marginRight: 4,
  },
  cell: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    margin: 1,
  },
  cellText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendText: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  legendGradient: {
    flexDirection: 'row',
    height: 12,
    width: 120,
  },
  legendCell: {
    flex: 1,
    height: 12,
  },
});