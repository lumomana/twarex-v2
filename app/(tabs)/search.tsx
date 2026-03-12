import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Search as SearchIcon, X, Filter, Image as ImageIcon } from 'lucide-react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';
import TweetItem from '@/components/TweetItem';
import { Tweet } from '@/types/twitter';
import DateRangePicker from '@/components/DateRangePicker';
import MediaGrid from '@/components/MediaGrid';

type SearchTab = 'tweets' | 'media';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tweet[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SearchTab>('tweets');
  const [mediaItems, setMediaItems] = useState<{
    url: string;
    type: 'photo' | 'video';
    tweetId: string;
    date: string;
  }[]>([]);
  const [searchStats, setSearchStats] = useState<{
    occurrenceCount: number;
    firstOccurrence: Tweet | null;
  } | null>(null);
  const { archiveData, selectYear, selectMonth, selectDay, selectTweet } = useArchiveStore();
  const { colors } = useThemeStore();

  // Extract all media from the archive
  useEffect(() => {
    if (activeTab === 'media') {
      const allMedia: {
        url: string;
        type: 'photo' | 'video';
        tweetId: string;
        date: string;
      }[] = [];
      
      archiveData.years.forEach(year => {
        year.months.forEach(month => {
          month.days.forEach(day => {
            day.tweets.forEach(tweet => {
              if (tweet.media && tweet.media.length > 0) {
                tweet.media.forEach(media => {
                  allMedia.push({
                    url: media.url,
                    type: media.type,
                    tweetId: tweet.id,
                    date: tweet.created_at
                  });
                });
              }
            });
          });
        });
      });
      
      setMediaItems(allMedia);
    }
  }, [activeTab, archiveData]);

  const handleSearch = () => {
    if (!searchQuery.trim() && !startDate && !endDate) {
      setSearchResults([]);
      setSearchStats(null);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: Tweet[] = [];
    let occurrenceCount = 0;
    let firstOccurrence: Tweet | null = null;

    // Convert string dates to Date objects for comparison
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;
    
    // If end date is provided, set it to the end of the day for inclusive search
    if (endDateObj) {
      endDateObj.setHours(23, 59, 59, 999);
    }

    // Search through all tweets
    archiveData.years.forEach(year => {
      year.months.forEach(month => {
        month.days.forEach(day => {
          day.tweets.forEach(tweet => {
            const tweetDate = new Date(tweet.created_at);
            const matchesDateRange = 
              (!startDateObj || tweetDate >= startDateObj) && 
              (!endDateObj || tweetDate <= endDateObj);

            // For media tab, only include tweets with media
            if (activeTab === 'media' && (!tweet.media || tweet.media.length === 0)) {
              return;
            }

            // If we have a query, check for occurrences
            if (query && matchesDateRange) {
              // Count occurrences of the search term in this tweet
              const tweetText = tweet.text.toLowerCase();
              let startIndex = 0;
              let count = 0;
              
              while (startIndex < tweetText.length) {
                const index = tweetText.indexOf(query, startIndex);
                if (index === -1) break;
                
                count++;
                startIndex = index + query.length;
              }
              
              if (count > 0) {
                // Add to total occurrence count
                occurrenceCount += count;
                
                // Track first occurrence (earliest tweet with the term)
                if (!firstOccurrence || new Date(tweet.created_at) < new Date(firstOccurrence.created_at)) {
                  firstOccurrence = tweet;
                }
                
                // Add to search results
                results.push(tweet);
              }
            } 
            // If we're just filtering by date range without a query
            else if (!query && matchesDateRange) {
              results.push(tweet);
            }
          });
        });
      });
    });

    setSearchResults(results);
    
    // Only set search stats if we have a query
    if (query) {
      setSearchStats({
        occurrenceCount,
        firstOccurrence
      });
    } else {
      setSearchStats(null);
    }

    // If in media tab, filter media items based on search results
    if (activeTab === 'media') {
      const resultIds = new Set(results.map(tweet => tweet.id));
      const filteredMedia = mediaItems.filter(item => resultIds.has(item.tweetId));
      
      // Filter by date range if no query
      if (!query && (startDateObj || endDateObj)) {
        const dateFilteredMedia = mediaItems.filter(item => {
          const itemDate = new Date(item.date);
          return (!startDateObj || itemDate >= startDateObj) && 
                 (!endDateObj || itemDate <= endDateObj);
        });
        setMediaItems(dateFilteredMedia);
      } else if (query) {
        setMediaItems(filteredMedia);
      }
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setSearchResults([]);
    setSearchStats(null);
    
    // Reset media items if in media tab
    if (activeTab === 'media') {
      const allMedia: {
        url: string;
        type: 'photo' | 'video';
        tweetId: string;
        date: string;
      }[] = [];
      
      archiveData.years.forEach(year => {
        year.months.forEach(month => {
          month.days.forEach(day => {
            day.tweets.forEach(tweet => {
              if (tweet.media && tweet.media.length > 0) {
                tweet.media.forEach(media => {
                  allMedia.push({
                    url: media.url,
                    type: media.type,
                    tweetId: tweet.id,
                    date: tweet.created_at
                  });
                });
              }
            });
          });
        });
      });
      
      setMediaItems(allMedia);
    }
  };

  const handleTweetPress = (tweet: Tweet) => {
    // Extract date parts from tweet created_at
    const date = new Date(tweet.created_at);
    const year = date.getFullYear().toString();
    const month = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const day = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    // Navigate to the tweet
    selectYear(year);
    selectMonth(month);
    selectDay(day);
    selectTweet(tweet.id);
  };

  const handleMediaPress = (tweetId: string) => {
    // Find the tweet that contains this media
    let targetTweet: Tweet | null = null;
    
    archiveData.years.forEach(year => {
      year.months.forEach(month => {
        month.days.forEach(day => {
          day.tweets.forEach(tweet => {
            if (tweet.id === tweetId) {
              targetTweet = tweet;
            }
          });
        });
      });
    });
    
    if (targetTweet) {
      handleTweetPress(targetTweet);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const hasActiveFilters = !!(startDate || endDate);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const switchTab = (tab: SearchTab) => {
    setActiveTab(tab);
    
    // Reset search results when switching tabs
    setSearchResults([]);
    setSearchStats(null);
    
    // If switching to media tab, load all media
    if (tab === 'media') {
      const allMedia: {
        url: string;
        type: 'photo' | 'video';
        tweetId: string;
        date: string;
      }[] = [];
      
      archiveData.years.forEach(year => {
        year.months.forEach(month => {
          month.days.forEach(day => {
            day.tweets.forEach(tweet => {
              if (tweet.media && tweet.media.length > 0) {
                tweet.media.forEach(media => {
                  allMedia.push({
                    url: media.url,
                    type: media.type,
                    tweetId: tweet.id,
                    date: tweet.created_at
                  });
                });
              }
            });
          });
        });
      });
      
      setMediaItems(allMedia);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.white }]}>Search Archive</Text>
      </View>
      
      <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'tweets' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => switchTab('tweets')}
        >
          <Text 
            style={[
              styles.tabButtonText, 
              { color: activeTab === 'tweets' ? colors.primary : colors.textSecondary }
            ]}
          >
            Tweets
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'media' && [styles.activeTabButton, { borderBottomColor: colors.primary }]
          ]}
          onPress={() => switchTab('media')}
        >
          <ImageIcon 
            size={16} 
            color={activeTab === 'media' ? colors.primary : colors.textSecondary} 
            style={styles.tabButtonIcon}
          />
          <Text 
            style={[
              styles.tabButtonText, 
              { color: activeTab === 'media' ? colors.primary : colors.textSecondary }
            ]}
          >
            Media
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.lightGray }]}>
          <SearchIcon size={20} color={colors.secondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={activeTab === 'tweets' ? "Search tweets..." : "Search media..."}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <X size={18} color={colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { 
              backgroundColor: hasActiveFilters ? colors.primaryLight : colors.lightGray,
              borderColor: hasActiveFilters ? colors.primary : colors.border
            }
          ]} 
          onPress={toggleFilters}
        >
          <Filter 
            size={18} 
            color={hasActiveFilters ? colors.primary : colors.secondary} 
          />
          {hasActiveFilters && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.filterBadgeText, { color: colors.white }]}>
                {(startDate ? 1 : 0) + (endDate ? 1 : 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.primary }]} 
          onPress={handleSearch}
          disabled={!searchQuery.trim() && !startDate && !endDate}
        >
          <Text style={[styles.searchButtonText, { color: colors.white }]}>Search</Text>
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Date Range</Text>
            {hasActiveFilters && (
              <TouchableOpacity 
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                style={styles.clearFiltersButton}
              >
                <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </View>
      )}
      
      {activeTab === 'tweets' ? (
        // Tweets Tab Content
        searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TweetItem 
                tweet={item} 
                onPress={() => handleTweetPress(item)}
                compact
                highlightText={searchQuery}
              />
            )}
            contentContainerStyle={styles.resultsList}
            ListHeaderComponent={
              <View>
                <View style={[styles.resultsHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.resultsCount, { color: colors.text }]}>
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </Text>
                  {hasActiveFilters && (
                    <Text style={[styles.dateRangeText, { color: colors.textSecondary }]}>
                      {startDate ? new Date(startDate).toLocaleDateString() : 'Any date'} 
                      {' - '} 
                      {endDate ? new Date(endDate).toLocaleDateString() : 'Any date'}
                    </Text>
                  )}
                </View>
                
                {searchStats && searchQuery.trim() && (
                  <View style={[styles.statsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <Text style={[styles.statsTitle, { color: colors.text }]}>
                      Search Statistics
                    </Text>
                    
                    <View style={styles.statRow}>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Occurrences of "{searchQuery}":
                      </Text>
                      <Text style={[styles.statValue, { color: colors.primary }]}>
                        {searchStats.occurrenceCount}
                      </Text>
                    </View>
                    
                    {searchStats.firstOccurrence && (
                      <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                          First occurrence:
                        </Text>
                        <TouchableOpacity 
                          onPress={() => handleTweetPress(searchStats.firstOccurrence!)}
                        >
                          <Text style={[styles.statValueLink, { color: colors.primary }]}>
                            {formatDate(searchStats.firstOccurrence.created_at)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            {(searchQuery.trim() || hasActiveFilters) ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tweets found matching your search criteria
              </Text>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Search for tweets in your archive
              </Text>
            )}
          </View>
        )
      ) : (
        // Media Tab Content
        <MediaGrid 
          mediaItems={mediaItems}
          onMediaPress={handleMediaPress}
          searchQuery={searchQuery}
          hasActiveFilters={hasActiveFilters}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </SafeAreaView>
  );
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
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabButtonIcon: {
    marginRight: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontWeight: '600',
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsList: {
    paddingBottom: 16,
  },
  resultsHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateRangeText: {
    fontSize: 14,
  },
  statsContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statValueLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});