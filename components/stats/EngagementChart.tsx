import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';

const { width: screenWidth } = Dimensions.get('window');

export default function EngagementChart() {
  const { archiveData } = useArchiveStore();
  const { colors } = useThemeStore();
  
  // Calculate engagement metrics per year
  const yearlyEngagement = archiveData.years.map(year => {
    let likes = 0;
    let retweets = 0;
    let tweetCount = 0;
    
    year.months.forEach(month => {
      month.days.forEach(day => {
        day.tweets.forEach(tweet => {
          likes += tweet.favorite_count;
          retweets += tweet.retweet_count;
          tweetCount++;
        });
      });
    });
    
    return {
      year: year.year,
      avgLikes: tweetCount > 0 ? likes / tweetCount : 0,
      avgRetweets: tweetCount > 0 ? retweets / tweetCount : 0
    };
  });
  
  // Find maximum values for scaling
  const maxLikes = Math.max(...yearlyEngagement.map(item => item.avgLikes));
  const maxRetweets = Math.max(...yearlyEngagement.map(item => item.avgRetweets));
  const maxValue = Math.max(maxLikes, maxRetweets);
  
  // Calculate bar width based on number of years
  const groupWidth = Math.min(80, (screenWidth - 64) / yearlyEngagement.length - 8);
  const barWidth = (groupWidth - 8) / 2;
  
  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>{maxValue.toFixed(1)}</Text>
        <Text style={[styles.axisLabel, { color: colors.textSecondary }]}>{(maxValue / 2).toFixed(1)}</Text>
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
          {yearlyEngagement.map((item, index) => {
            const likesHeight = (item.avgLikes / maxValue) * 200;
            const retweetsHeight = (item.avgRetweets / maxValue) * 200;
            
            return (
              <View key={item.year} style={styles.barGroup}>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: likesHeight, 
                        width: barWidth,
                        backgroundColor: colors.primary 
                      }
                    ]} 
                  />
                </View>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: retweetsHeight, 
                        width: barWidth,
                        backgroundColor: colors.accent 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{item.year}</Text>
              </View>
            );
          })}
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Avg. Likes</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Avg. Retweets</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
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
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  barWrapper: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
    position: 'absolute',
    bottom: -20,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    position: 'absolute',
    bottom: 0,
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
    fontSize: 12,
  },
});