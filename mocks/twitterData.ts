import { ArchiveData, Tweet } from '@/types/twitter';

// Helper to create a tweet
const createTweet = (
  id: string,
  text: string,
  date: string,
  favorites: number,
  retweets: number,
  hasMedia: boolean = false
): Tweet => ({
  id,
  text,
  created_at: date,
  favorite_count: favorites,
  retweet_count: retweets,
  user: {
    name: 'Elena Moreno',
    screen_name: 'elenamoreno_edu',
    profile_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    bio: 'High school literature teacher 📚 | Education advocate | Coffee enthusiast | Sharing classroom insights and book recommendations since 2012'
  },
  ...(hasMedia ? {
    media: [{
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    }]
  } : {})
});

// Generate random tweets for a specific day
const generateTweetsForDay = (date: string, count: number): Tweet[] => {
  const tweets: Tweet[] = [];
  for (let i = 0; i < count; i++) {
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const dateTime = `${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}.000Z`;
    
    const tweetTexts = [
      "Just finished grading papers. My students' analysis of Márquez's magical realism is impressive! 📚 #teacherlife",
      "Parent-teacher conferences today. Always love connecting with families about their children's progress! 👩‍🏫 #education",
      "Recommended 'The House on Mango Street' to my 10th graders today. Can't wait to see their responses! 📖 #literature",
      "Professional development day. Learning new strategies for inclusive classroom discussions. Always growing! 🌱 #teachergrowth",
      "My students are presenting their poetry projects today. So proud of their creativity and insight! 🎭 #studentwork",
      "Coffee is essential when you have 120 essays to grade over the weekend. Send caffeine! ☕️ #teacherproblems",
      "Classroom debate on 'To Kill a Mockingbird' today. These kids have such thoughtful perspectives! #teaching #literature",
      "Setting up my classroom for the new semester. New books, new bulletin boards, new possibilities! 📚 #backtoschool",
      "Attended an amazing workshop on multicultural literature today. So many great titles to add to my curriculum! #diversity #education",
      "End of semester reflections with my students today. Their growth this year brings me so much joy. This is why I teach. ❤️ #teacherlife"
    ];
    
    const randomText = tweetTexts[Math.floor(Math.random() * tweetTexts.length)];
    const favorites = Math.floor(Math.random() * 50);
    const retweets = Math.floor(Math.random() * 20);
    const hasMedia = Math.random() > 0.7; // 30% chance of having media
    
    tweets.push(createTweet(`tweet-${date}-${i}`, randomText, dateTime, favorites, retweets, hasMedia));
  }
  return tweets;
};

// Generate days for a month
const generateDaysForMonth = (year: number, month: number): { days: any[], tweetCount: number } => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  let totalTweets = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    // More tweets on weekends and random spikes
    const isWeekend = new Date(year, month - 1, day).getDay() % 6 === 0;
    const randomSpike = Math.random() > 0.9; // 10% chance of a spike
    
    let tweetCount = Math.floor(Math.random() * 3); // Base: 0-2 tweets
    if (isWeekend) tweetCount += Math.floor(Math.random() * 5); // Add 0-4 more on weekends
    if (randomSpike) tweetCount += Math.floor(Math.random() * 10); // Add 0-9 more on spikes
    
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const tweets = generateTweetsForDay(dateStr, tweetCount);
    
    days.push({
      date: dateStr,
      tweetCount,
      tweets
    });
    
    totalTweets += tweetCount;
  }
  
  return { days, tweetCount: totalTweets };
};

// Generate months for a year
const generateMonthsForYear = (year: number): { months: any[], tweetCount: number } => {
  const months = [];
  let totalTweets = 0;
  
  for (let month = 1; month <= 12; month++) {
    const { days, tweetCount } = generateDaysForMonth(year, month);
    months.push({
      month: `${year}-${month.toString().padStart(2, '0')}`,
      tweetCount,
      days
    });
    
    totalTweets += tweetCount;
  }
  
  return { months, tweetCount: totalTweets };
};

// Generate the full archive data
export const generateArchiveData = (): ArchiveData => {
  const years = [];
  let totalTweets = 0;
  
  // Generate data from 2012 to current year
  const currentYear = new Date().getFullYear();
  for (let year = 2012; year <= currentYear; year++) {
    const { months, tweetCount } = generateMonthsForYear(year);
    years.push({
      year: year.toString(),
      tweetCount,
      months
    });
    
    totalTweets += tweetCount;
  }
  
  return {
    years,
    totalTweets
  };
};

// Export the mock data
export const mockTwitterArchive = generateArchiveData();