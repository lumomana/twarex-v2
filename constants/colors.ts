export const lightColors = {
  primary: '#C70039', // Red
  primaryLight: '#FFEBEE', // Light red background
  secondary: '#657786', // Twitter gray
  accent: '#FF9500', // Orange for months
  accentLight: '#FFD60A', // Light yellow for days
  background: '#9D3E0C', // Updated to dark orange/brown background
  text: '#14171A',
  textSecondary: '#657786',
  border: '#E1E8ED',
  success: '#4BB543',
  error: '#FF3B30',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#F5F8FA',
  card: '#A7D6CD', // Updated from #FFFFFF to #A7D6CD
  headerBackground: '#0B5345', // New dark teal color for headers
};

export const darkColors = {
  primary: '#FF4D6D', // Brighter red for dark mode
  primaryLight: '#3A1C24', // Dark red background
  secondary: '#8899A6', // Lighter gray for dark mode
  accent: '#FF9F1C', // Brighter orange for months
  accentLight: '#FFBF69', // Brighter yellow for days
  background: '#15202B', // Twitter dark blue background
  text: '#FFFFFF',
  textSecondary: '#8899A6',
  border: '#38444D',
  success: '#4BB543',
  error: '#FF3B30',
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#192734',
  card: '#22303C',
  headerBackground: '#0B5345', // Same dark teal color for headers in dark mode
};

// Default export will be determined by the theme store
export const colors = lightColors;