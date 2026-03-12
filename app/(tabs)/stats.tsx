import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart2, PieChart, TrendingUp, Calendar, Clock, Heart, Repeat, MessageCircle } from 'lucide-react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import ActivityHeatmap from '@/components/stats/ActivityHeatmap';
import EngagementChart from '@/components/stats/EngagementChart';
import PostingTrendsChart from '@/components/stats/PostingTrendsChart';
import TopWordsCloud from '@/components/stats/TopWordsCloud';
import StatsCard from '@/components/stats/StatsCard';
import TimeDistributionChart from '@/components/stats/TimeDistributionChart';

export default function StatsScreen() {
  const { archiveData } = useArchiveStore();
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate overall statistics
  const totalTweets = archiveData.totalTweets;
  const totalYears = archiveData.years.length;
  const avgTweetsPerYear = Math.round(totalTweets / totalYears);
  
  // Calculate engagement statistics
  const totalLikes = archiveData.years.reduce((sum, year) => {
    return sum + year.months.reduce((monthSum, month) => {
      return monthSum + month.days.reduce((daySum, day) => {
        return daySum + day.tweets.reduce((tweetSum, tweet) => {
          return tweetSum + tweet.favorite_count;
        }, 0);
      }, 0);
    }, 0);
  }, 0);

  const totalRetweets = archiveData.years.reduce((sum, year) => {
    return sum + year.months.reduce((monthSum, month) => {
      return monthSum + month.days.reduce((daySum, day) => {
        return daySum + day.tweets.reduce((tweetSum, tweet) => {
          return tweetSum + tweet.retweet_count;
        }, 0);
      }, 0);
    }, 0);
  }, 0);

  const avgLikesPerTweet = Math.round((totalLikes / totalTweets) * 10) / 10;
  const avgRetweetsPerTweet = Math.round((totalRetweets / totalTweets) * 10) / 10;

  // Find most active year and month
  let mostActiveYear = { year: '', count: 0 };
  let mostActiveMonth = { month: '', count: 0 };

  archiveData.years.forEach(year => {
    if (year.tweetCount > mostActiveYear.count) {
      mostActiveYear = { year: year.year, count: year.tweetCount };
    }

    year.months.forEach(month => {
      if (month.tweetCount > mostActiveMonth.count) {
        const date = new Date(month.month + '-01');
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        mostActiveMonth = { month: monthName, count: month.tweetCount };
      }
    });
  });

  // Calculate tweets with media
  const tweetsWithMedia = archiveData.years.reduce((sum, year) => {
    return sum + year.months.reduce((monthSum, month) => {
      return monthSum + month.days.reduce((daySum, day) => {
        return daySum + day.tweets.filter(tweet => tweet.media && tweet.media.length > 0).length;
      }, 0);
    }, 0);
  }, 0);

  const mediaPercentage = Math.round((tweetsWithMedia / totalTweets) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.white }]}>Statistics</Text>
      </View>

      <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'overview' && [styles.activeTab, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <BarChart2 
              size={16} 
              color={activeTab === 'overview' ? colors.primary : colors.textSecondary} 
              style={styles.tabIcon} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'overview' ? colors.primary : colors.textSecondary }
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'trends' && [styles.activeTab, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('trends')}
          >
            <TrendingUp 
              size={16} 
              color={activeTab === 'trends' ? colors.primary : colors.textSecondary} 
              style={styles.tabIcon} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'trends' ? colors.primary : colors.textSecondary }
              ]}
            >
              Trends
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'engagement' && [styles.activeTab, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('engagement')}
          >
            <Heart 
              size={16} 
              color={activeTab === 'engagement' ? colors.primary : colors.textSecondary} 
              style={styles.tabIcon} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'engagement' ? colors.primary : colors.textSecondary }
              ]}
            >
              Engagement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'activity' && [styles.activeTab, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('activity')}
          >
            <Calendar 
              size={16} 
              color={activeTab === 'activity' ? colors.primary : colors.textSecondary} 
              style={styles.tabIcon} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'activity' ? colors.primary : colors.textSecondary }
              ]}
            >
              Activity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'content' && [styles.activeTab, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]
            ]}
            onPress={() => setActiveTab('content')}
          >
            <MessageCircle 
              size={16} 
              color={activeTab === 'content' ? colors.primary : colors.textSecondary} 
              style={styles.tabIcon} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'content' ? colors.primary : colors.textSecondary }
              ]}
            >
              Content
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <View style={styles.statsGrid}>
              <StatsCard 
                title="Total Tweets"
                value={totalTweets.toString()}
                icon={<MessageCircle size={20} color={colors.primary} />}
                colors={colors}
              />
              <StatsCard 
                title="Years Active"
                value={totalYears.toString()}
                icon={<Calendar size={20} color={colors.primary} />}
                colors={colors}
              />
              <StatsCard 
                title="Avg. Tweets/Year"
                value={avgTweetsPerYear.toString()}
                icon={<BarChart2 size={20} color={colors.primary} />}
                colors={colors}
              />
              <StatsCard 
                title="Media Tweets"
                value={`${mediaPercentage}%`}
                icon={<PieChart size={20} color={colors.primary} />}
                colors={colors}
              />
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Activity Summary</Text>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Most Active Year:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {mostActiveYear.year} ({mostActiveYear.count} tweets)
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Most Active Month:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {mostActiveMonth.month} ({mostActiveMonth.count} tweets)
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Average Likes:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {avgLikesPerTweet} per tweet
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Average Retweets:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {avgRetweetsPerTweet} per tweet
                </Text>
              </View>
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Yearly Activity</Text>
              <PostingTrendsChart />
            </View>
          </View>
        )}

        {activeTab === 'trends' && (
          <View style={styles.tabContent}>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Posting Trends Over Time</Text>
              <PostingTrendsChart />
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Time of Day Distribution</Text>
              <TimeDistributionChart />
            </View>
          </View>
        )}

        {activeTab === 'engagement' && (
          <View style={styles.tabContent}>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Engagement Metrics</Text>
              <EngagementChart />
            </View>

            <View style={[styles.statsGrid, { marginTop: 16 }]}>
              <StatsCard 
                title="Total Likes"
                value={totalLikes.toLocaleString()}
                icon={<Heart size={20} color={colors.primary} />}
                colors={colors}
              />
              <StatsCard 
                title="Total Retweets"
                value={totalRetweets.toLocaleString()}
                icon={<Repeat size={20} color={colors.primary} />}
                colors={colors}
              />
              <StatsCard 
                title="Avg. Likes"
                value={avgLikesPerTweet.toString()}
                icon={<Heart size={20} color={colors.primary} />}
                colors={colors}
              />
              <StatsCard 
                title="Avg. Retweets"
                value={avgRetweetsPerTweet.toString()}
                icon={<Repeat size={20} color={colors.primary} />}
                colors={colors}
              />
            </View>
          </View>
        )}

        {activeTab === 'activity' && (
          <View style={styles.tabContent}>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Activity Heatmap</Text>
              <ActivityHeatmap />
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Time of Day Distribution</Text>
              <TimeDistributionChart />
            </View>
          </View>
        )}

        {activeTab === 'content' && (
          <View style={styles.tabContent}>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Most Used Words</Text>
              <TopWordsCloud />
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Content Analysis</Text>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tweets with Media:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {tweetsWithMedia} ({mediaPercentage}%)
                </Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Average Tweet Length:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {calculateAvgTweetLength(archiveData)} characters
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to calculate average tweet length
function calculateAvgTweetLength(archiveData: any) {
  let totalLength = 0;
  let tweetCount = 0;

  archiveData.years.forEach((year: any) => {
    year.months.forEach((month: any) => {
      month.days.forEach((day: any) => {
        day.tweets.forEach((tweet: any) => {
          totalLength += tweet.text.length;
          tweetCount++;
        });
      });
    });
  });

  return Math.round(totalLength / tweetCount);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    borderWidth: 1,
  },
  tabIcon: {
    marginRight: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});