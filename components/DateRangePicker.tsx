import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
}

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangePickerProps) {
  const { colors } = useThemeStore();
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [startDateInput, setStartDateInput] = useState(startDate || '');
  const [endDateInput, setEndDateInput] = useState(endDate || '');

  // Validate date format
  const validateDate = (dateString: string): boolean => {
    // Check if it's a valid date in YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if it's a valid date
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // months are 0-indexed in JS Date
    const day = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    return date.getFullYear() === year && 
           date.getMonth() === month && 
           date.getDate() === day;
  };

  // Handle start date change
  const handleStartDateChange = (text: string) => {
    setStartDateInput(text);
    setStartDateError(null);
    
    if (!text) {
      onStartDateChange(null);
      return;
    }
    
    if (validateDate(text)) {
      onStartDateChange(text);
      
      // Check if start date is after end date
      if (endDate && new Date(text) > new Date(endDate)) {
        setStartDateError("Start date can't be after end date");
      }
    } else {
      setStartDateError("Use YYYY-MM-DD format");
      onStartDateChange(null);
    }
  };

  // Handle end date change
  const handleEndDateChange = (text: string) => {
    setEndDateInput(text);
    setEndDateError(null);
    
    if (!text) {
      onEndDateChange(null);
      return;
    }
    
    if (validateDate(text)) {
      onEndDateChange(text);
      
      // Check if end date is before start date
      if (startDate && new Date(text) < new Date(startDate)) {
        setEndDateError("End date can't be before start date");
      }
    } else {
      setEndDateError("Use YYYY-MM-DD format");
      onEndDateChange(null);
    }
  };

  // Handle start date blur - final validation
  const handleStartDateBlur = () => {
    if (startDateInput && !validateDate(startDateInput)) {
      setStartDateError("Use YYYY-MM-DD format");
      onStartDateChange(null);
    }
  };

  // Handle end date blur - final validation
  const handleEndDateBlur = () => {
    if (endDateInput && !validateDate(endDateInput)) {
      setEndDateError("Use YYYY-MM-DD format");
      onEndDateChange(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateInputsContainer}>
        {/* Start Date Input */}
        <View style={styles.dateInputWrapper}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>From</Text>
          <View style={[
            styles.dateInputContainer, 
            { 
              backgroundColor: colors.lightGray,
              borderColor: startDateError ? colors.error : colors.border 
            }
          ]}>
            <Calendar size={16} color={colors.secondary} style={styles.calendarIcon} />
            <TextInput
              style={[styles.dateInput, { color: colors.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={startDateInput}
              onChangeText={handleStartDateChange}
              onBlur={handleStartDateBlur}
              keyboardType={Platform.OS === 'ios' ? 'default' : 'numeric'}
            />
          </View>
          {startDateError && (
            <Text style={[styles.errorText, { color: colors.error }]}>{startDateError}</Text>
          )}
        </View>
        
        {/* End Date Input */}
        <View style={styles.dateInputWrapper}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>To</Text>
          <View style={[
            styles.dateInputContainer, 
            { 
              backgroundColor: colors.lightGray,
              borderColor: endDateError ? colors.error : colors.border 
            }
          ]}>
            <Calendar size={16} color={colors.secondary} style={styles.calendarIcon} />
            <TextInput
              style={[styles.dateInput, { color: colors.text }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={endDateInput}
              onChangeText={handleEndDateChange}
              onBlur={handleEndDateBlur}
              keyboardType={Platform.OS === 'ios' ? 'default' : 'numeric'}
            />
          </View>
          {endDateError && (
            <Text style={[styles.errorText, { color: colors.error }]}>{endDateError}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.helpContainer}>
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          Enter dates in YYYY-MM-DD format (e.g., 2020-01-31)
        </Text>
      </View>
      
      <View style={[styles.examplesContainer, { backgroundColor: colors.headerBackground, borderColor: colors.border }]}>
        <Text style={[styles.examplesTitle, { color: colors.white }]}>Quick Examples:</Text>
        <View style={styles.exampleButtonsContainer}>
          <TouchableOpacity 
            style={[styles.exampleButton, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}
            onPress={() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = String(today.getMonth() + 1).padStart(2, '0');
              const day = String(today.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              handleEndDateChange(dateStr);
            }}
          >
            <Text style={[styles.exampleButtonText, { color: colors.white }]}>Today</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.exampleButton, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}
            onPress={() => {
              const date = new Date();
              date.setMonth(date.getMonth() - 1);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              handleStartDateChange(dateStr);
            }}
          >
            <Text style={[styles.exampleButtonText, { color: colors.white }]}>Last Month</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.exampleButton, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}
            onPress={() => {
              const date = new Date();
              date.setFullYear(date.getFullYear() - 1);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              handleStartDateChange(dateStr);
            }}
          >
            <Text style={[styles.exampleButtonText, { color: colors.white }]}>Last Year</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  dateInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 40,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    height: 40,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helpContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  examplesContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  exampleButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  exampleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    margin: 4,
  },
  exampleButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});