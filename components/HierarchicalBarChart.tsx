import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useArchiveStore } from '@/store/archiveStore';
import { useThemeStore } from '@/store/themeStore';

export default function HierarchicalBarChart() {
  const { 
    archiveData, 
    selectYear, 
    selectMonth, 
    selectDay, 
    navigateToLevel,
    currentLevel,
    selectedYear,
    selectedMonth,
    selectedDay
  } = useArchiveStore();
  
  const { colors } = useThemeStore();
  
  // Calculate max values for each level
  const maxYearTweets = Math.max(...archiveData.years.map(y => y.tweetCount), 1);
  
  // Get years data
  const years = archiveData.years;
  
  // Get months data for selected year
  const selectedYearData = years.find(y => y.year === selectedYear);
  const months = selectedYearData?.months || [];
  const maxMonthTweets = months.length > 0 
    ? Math.max(...months.map(m => m.tweetCount), 1) 
    : 1;
  
  // Get days data for selected month
  const selectedMonthData = months.find(m => m.month === selectedMonth);
  const days = selectedMonthData?.days || [];
  const maxDayTweets = days.length > 0 
    ? Math.max(...days.map(d => d.tweetCount), 1) 
    : 1;

  // Handle tap on year bar
  const handleYearSelect = (year: any) => {
    selectYear(year);
  };
  
  // Handle tap on month bar
  const handleMonthSelect = (month: any) => {
    selectMonth(month);
  };
  
  // Handle tap on day bar
  const handleDaySelect = (day: any) => {
    selectDay(day);
  };
  
  // Handle tap on background to go up in hierarchy
  const handleBackgroundTap = () => {
    switch (currentLevel) {
      case 'year':
        navigateToLevel('global');
        break;
      case 'month':
        navigateToLevel('year');
        break;
      case 'day':
      case 'tweet':
        navigateToLevel('month');
        break;
    }
  };
  
  // Render year bars
  const renderYearBars = () => {
    return (
      <View style={styles.barsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Years</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {years.map((year) => (
            <TouchableOpacity 
              key={year.year}
              style={[
                styles.barItem,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedYear === year.year && [styles.selectedBarItem, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]
              ]}
              onPress={() => handleYearSelect(year.year)}
            >
              <Text style={[styles.barLabel, { color: colors.text }]}>{year.year}</Text>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: Math.max(16, (year.tweetCount / maxYearTweets) * 100),
                      backgroundColor: selectedYear === year.year ? colors.primary : colors.secondary
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>{year.tweetCount}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // Render month bars
  const renderMonthBars = () => {
    if (!selectedYear || months.length === 0) return null;
    
    return (
      <View style={styles.barsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Months in {selectedYear}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {months.map((month) => {
            const date = new Date(month.month + '-01');
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            
            return (
              <TouchableOpacity 
                key={month.month}
                style={[
                  styles.barItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedMonth === month.month && [styles.selectedBarItem, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]
                ]}
                onPress={() => handleMonthSelect(month.month)}
              >
                <Text style={[styles.barLabel, { color: colors.text }]}>{monthName}</Text>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        width: Math.max(16, (month.tweetCount / maxMonthTweets) * 100),
                        backgroundColor: selectedMonth === month.month ? colors.primary : colors.accent
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.barCount, { color: colors.textSecondary }]}>{month.tweetCount}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  // Render day bars
  const renderDayBars = () => {
    if (!selectedMonth || days.length === 0) return null;
    
    return (
      <View style={styles.barsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Days in {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long' })}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.daysContainer}>
            {days.map((day) => {
              const date = new Date(day.date);
              const dayNum = date.getDate();
              
              return (
                <TouchableOpacity 
                  key={day.date}
                  style={[
                    styles.dayBarItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedDay === day.date && [styles.selectedBarItem, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]
                  ]}
                  onPress={() => handleDaySelect(day.date)}
                >
                  <Text style={[styles.dayBarLabel, { color: colors.text }]}>{dayNum}</Text>
                  <View style={styles.dayBarWrapper}>
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          width: Math.max(10, (day.tweetCount / maxDayTweets) * 60),
                          backgroundColor: selectedDay === day.date ? colors.primary : colors.accentLight
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.dayBarCount, { color: colors.textSecondary }]}>{day.tweetCount}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };
  
  return (
    <TouchableOpacity 
      activeOpacity={1}
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={handleBackgroundTap}
    >
      {/* Always show years in global view */}
      {currentLevel === 'global' && renderYearBars()}
      
      {/* Show years and months in year view */}
      {currentLevel === 'year' && (
        <>
          {renderYearBars()}
          {renderMonthBars()}
        </>
      )}
      
      {/* Show years, months, and days in month view */}
      {currentLevel === 'month' && (
        <>
          {renderYearBars()}
          {renderMonthBars()}
          {renderDayBars()}
        </>
      )}
      
      {/* Show years, months, and days in day view */}
      {currentLevel === 'day' && (
        <>
          {renderYearBars()}
          {renderMonthBars()}
          {renderDayBars()}
        </>
      )}
      
      <View style={[styles.legendContainer, { borderTopColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Years</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Months</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.accentLight }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Days</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  barsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  barItem: {
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 50,
  },
  dayBarItem: {
    alignItems: 'center',
    marginRight: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 28,
    maxWidth: 28,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  selectedBarItem: {
    borderWidth: 2,
  },
  barLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  dayBarLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  barWrapper: {
    marginVertical: 6,
    height: 16,
    justifyContent: 'center',
  },
  dayBarWrapper: {
    marginVertical: 4,
    height: 12,
    justifyContent: 'center',
  },
  bar: {
    height: 16,
    borderRadius: 3,
  },
  barCount: {
    fontSize: 11,
    marginTop: 4,
  },
  dayBarCount: {
    fontSize: 9,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
  },
});