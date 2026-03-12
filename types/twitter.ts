export interface Tweet {
  id: string;
  text: string;
  created_at: string; // ISO date string
  favorite_count: number;
  retweet_count: number;
  media?: {
    type: 'photo' | 'video';
    url: string;
  }[];
  user: {
    name: string;
    screen_name: string;
    profile_image_url: string;
    bio?: string;
  };
}

export interface DayData {
  date: string; // ISO date string (YYYY-MM-DD)
  tweetCount: number;
  tweets: Tweet[];
}

export interface MonthData {
  month: string; // YYYY-MM
  tweetCount: number;
  days: DayData[];
}

export interface YearData {
  year: string; // YYYY
  tweetCount: number;
  months: MonthData[];
}

export interface ArchiveData {
  years: YearData[];
  totalTweets: number;
}

export type TimelineLevel = 'global' | 'year' | 'month' | 'day' | 'tweet';

export interface MediaItem {
  url: string;
  type: 'photo' | 'video';
  tweetId: string;
  date: string;
}