import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';

export default function TopWordsCloud() {
  const { archiveData } = useArchiveStore();
  const { colors } = useThemeStore();
  
  // Extract all tweet text
  const allText = archiveData.years.reduce((text, year) => {
    return text + year.months.reduce((monthText, month) => {
      return monthText + month.days.reduce((dayText, day) => {
        return dayText + day.tweets.reduce((tweetText, tweet) => {
          return tweetText + ' ' + tweet.text;
        }, '');
      }, '');
    }, '');
  }, '');
  
  // Common words to exclude
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself',
    'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
    'these', 'those', 'am', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would',
    'should', 'could', 'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re',
    'i\'ve', 'you\'ve', 'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d',
    'i\'ll', 'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll', 'isn\'t', 'aren\'t', 'wasn\'t',
    'weren\'t', 'hasn\'t', 'haven\'t', 'hadn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t',
    'shan\'t', 'shouldn\'t', 'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s',
    'what\'s', 'here\'s', 'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s', 'rt', 'via', 'http',
    'https', 'com', 'amp'
  ]);
  
  // Count word frequencies
  const wordCounts: Record<string, number> = {};
  
  // Clean and tokenize text
  const words = allText
    .toLowerCase()
    .replace(/[^\w\s#@]/g, '') // Remove punctuation except # and @
    .split(/\s+/)
    .filter(word => {
      // Keep hashtags, mentions, and words longer than 2 characters that aren't stop words
      return (
        (word.startsWith('#') || word.startsWith('@') || word.length > 2) && 
        !stopWords.has(word) &&
        !/^\d+$/.test(word) // Filter out numbers
      );
    });
  
  // Count frequencies
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency and take top 30
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));
  
  // Find maximum count for scaling
  const maxCount = topWords.length > 0 ? topWords[0].count : 0;
  
  // Function to determine font size based on frequency
  const getFontSize = (count: any) => {
    const minSize = 10;
    const maxSize = 24;
    return minSize + (((count as number) / (maxCount as number)) * (maxSize - minSize));
  };
  
  // Function to get a color based on word type
  const getWordColor = (word: any) => {
    if (word.startsWith('#')) return colors.accent;
    if (word.startsWith('@')) return colors.primary;
    return colors.text;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.cloudContainer}>
        {topWords.map((item, index) => (
          <Text 
            key={index}
            style={[
              styles.word,
              { 
                fontSize: getFontSize(item.count),
                color: getWordColor(item.word),
                fontWeight: item.count > maxCount / 2 ? 'bold' : 'normal'
              }
            ]}
          >
            {item.word}
          </Text>
        ))}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.text }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Words</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>@Mentions</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>#Hashtags</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  cloudContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    padding: 8,
  },
  word: {
    margin: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
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