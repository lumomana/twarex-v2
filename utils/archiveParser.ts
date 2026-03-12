import JSZip from 'jszip';
import { ArchiveData, Tweet, DayData, MonthData, YearData } from '@/types/twitter';

/**
 * Find a file in the ZIP archive by its name, regardless of its path
 */
function findFileByName(zip: JSZip, fileName: string): JSZip.JSZipObject | null {
  const files = Object.keys(zip.files);
  const foundPath = files.find(path => path.endsWith('/' + fileName) || path === fileName);
  return foundPath ? zip.file(foundPath) : null;
}

/**
 * Try to find and extract the profile image from the ZIP
 */
async function extractProfileImage(zip: JSZip, accountData: any): Promise<string> {
  const allFiles = Object.keys(zip.files);
  
  // 1. Search in specific folders (profile_images or profile_media)
  const profileFolders = ['profile_images/', 'profile_media/', 'profile_image/'];
  const profileImageInFolder = allFiles.find(f => 
    profileFolders.some(folder => f.includes(folder)) && 
    f.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  
  if (profileImageInFolder) {
    console.log('Found profile image in folder:', profileImageInFolder);
    const file = zip.file(profileImageInFolder);
    if (file) {
      const base64 = await file.async('base64');
      const extension = profileImageInFolder.split('.').pop();
      return `data:image/${extension};base64,${base64}`;
    }
  }

  // 2. Try common individual filenames in the root or data folder
  const commonNames = ['profile.jpg', 'profile.png', 'profile_image.jpg', 'avatar.jpg', 'avatar.png'];
  for (const name of commonNames) {
    const file = findFileByName(zip, name);
    if (file) {
      const base64 = await file.async('base64');
      const extension = file.name.split('.').pop();
      return `data:image/${extension};base64,${base64}`;
    }
  }

  // 3. Fallback to the URL from account data
  const profileUrl = accountData.profileImageUrl || accountData.profile_image_url_https || accountData.profile_image_url;
  if (profileUrl && (profileUrl.startsWith('http') || profileUrl.startsWith('data:'))) {
    return profileUrl;
  }

  // 4. Final fallback
  return 'https://images.unsplash.com/photo-1599566150163-29194dcaad36';
}

/**
 * Parse a Twitter archive ZIP file and convert it to our app's data format
 */
export async function parseTwitterArchive(fileData: ArrayBuffer | Blob): Promise<ArchiveData> {
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(fileData);
    
    let tweetsData: any[] = [];
    let accountRaw: any = {};
    
    // 1. Find and parse tweets data
    const tweetsFile = findFileByName(loadedZip, 'tweets.js') || 
                      findFileByName(loadedZip, 'tweet.js');
    
    if (tweetsFile) {
      const tweetsContent = await tweetsFile.async('string');
      const jsonMatch = tweetsContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tweetsData = JSON.parse(jsonMatch[0]);
      }
    }
    
    // 2. Find and parse account information
    const accountFile = findFileByName(loadedZip, 'account.js') || 
                       findFileByName(loadedZip, 'account-info.js');
    
    if (accountFile) {
      const accountContent = await accountFile.async('string');
      const jsonMatch = accountContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const accountArray = JSON.parse(jsonMatch[0]);
        if (accountArray.length > 0) {
          accountRaw = accountArray[0].account || accountArray[0];
        }
      }
    }

    // 3. Extract the real profile image
    const realProfileImage = await extractProfileImage(loadedZip, accountRaw);
    
    // 4. Convert tweets to our format
    const tweets: Tweet[] = tweetsData.map((rawTweet: any) => {
      const tweet = rawTweet.tweet || rawTweet;
      
      return {
        id: tweet.id_str || tweet.id || `tweet-${Math.random()}`,
        text: tweet.full_text || tweet.text || '',
        created_at: tweet.created_at || new Date().toISOString(),
        favorite_count: parseInt(tweet.favorite_count || 0),
        retweet_count: parseInt(tweet.retweet_count || 0),
        media: extractMediaFromTweet(tweet),
        user: {
          name: accountRaw.accountDisplayName || accountRaw.name || 'User',
          screen_name: accountRaw.username || accountRaw.screen_name || 'user',
          profile_image_url: realProfileImage,
          bio: accountRaw.accountBio || accountRaw.description
        }
      };
    });
    
    // 5. Organize tweets by date
    const tweetsByDate = new Map<string, Map<string, Map<string, Tweet[]>>>();
    
    tweets.forEach(tweet => {
      const date = new Date(tweet.created_at);
      const year = date.getFullYear().toString();
      const month = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const day = `${month}-${date.getDate().toString().padStart(2, '0')}`;
      
      if (!tweetsByDate.has(year)) {
        tweetsByDate.set(year, new Map());
      }
      
      const yearMap = tweetsByDate.get(year)!;
      if (!yearMap.has(month)) {
        yearMap.set(month, new Map());
      }
      
      const monthMap = yearMap.get(month)!;
      if (!monthMap.has(day)) {
        monthMap.set(day, []);
      }
      
      monthMap.get(day)!.push(tweet);
    });
    
    // 6. Build final data structure
    const years: YearData[] = [];
    let totalTweets = 0;
    
    tweetsByDate.forEach((yearMap, year) => {
      const months: MonthData[] = [];
      let yearTweetCount = 0;
      
      yearMap.forEach((monthMap, month) => {
        const days: DayData[] = [];
        let monthTweetCount = 0;
        
        monthMap.forEach((dayTweets, date) => {
          days.push({
            date,
            tweetCount: dayTweets.length,
            tweets: dayTweets
          });
          monthTweetCount += dayTweets.length;
        });
        
        days.sort((a, b) => a.date.localeCompare(b.date));
        months.push({ month, tweetCount: monthTweetCount, days });
        yearTweetCount += monthTweetCount;
      });
      
      months.sort((a, b) => a.month.localeCompare(b.month));
      years.push({ year, tweetCount: yearTweetCount, months });
      totalTweets += yearTweetCount;
    });
    
    years.sort((a, b) => a.year.localeCompare(b.year));
    
    return { years, totalTweets };
  } catch (error) {
    console.error('Error parsing Twitter archive:', error);
    throw new Error(`Failed to parse Twitter archive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract media information from a tweet
 */
function extractMediaFromTweet(tweet: any): Tweet['media'] {
  const media: Tweet['media'] = [];
  
  if (tweet.extended_entities?.media) {
    tweet.extended_entities.media.forEach((m: any) => {
      media.push({
        type: m.type === 'video' || m.type === 'animated_gif' ? 'video' : 'photo',
        url: m.media_url_https || m.media_url || ''
      });
    });
  } else if (tweet.entities?.media) {
    tweet.entities.media.forEach((m: any) => {
      media.push({
        type: m.type === 'video' || m.type === 'animated_gif' ? 'video' : 'photo',
        url: m.media_url_https || m.media_url || ''
      });
    });
  }
  
  return media.length > 0 ? media : undefined;
}

/**
 * Validate that a file is a valid Twitter archive
 */
export async function validateTwitterArchive(fileData: ArrayBuffer | Blob): Promise<{ valid: boolean; message: string }> {
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(fileData);
    
    const hasTweetsFile = findFileByName(loadedZip, 'tweets.js') !== null || 
                         findFileByName(loadedZip, 'tweet.js') !== null;
    
    if (!hasTweetsFile) {
      return {
        valid: false,
        message: 'This does not appear to be a valid Twitter archive. Could not find tweets data (tweets.js).'
      };
    }
    
    return { valid: true, message: 'Valid Twitter archive' };
  } catch (error) {
    return {
      valid: false,
      message: `Invalid archive file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
