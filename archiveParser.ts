/**
 * archiveParser.ts
 * Parsing complet des archives Twitter/X au format ZIP.
 *
 * Twitter fournit une archive ZIP contenant des fichiers .js du type :
 *   window.YTD.tweets.part0 = [ ... ]
 * On extrait le JSON en retirant le préfixe JS.
 *
 * Fichiers pris en charge :
 *   - tweet.js / tweets.js / tweets-part*.js
 *   - account.js
 *   - profile.js
 *   - like.js / likes.js
 *   - follower.js / followers.js
 *   - following.js
 *   - direct-messages.js
 *   - media/ (images, vidéos)
 */

import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';

// ─── Types exportés ──────────────────────────────────────────────────────────

export interface TwitterUser {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  avatarUrl?: string;
  bannerUrl?: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
}

export interface Tweet {
  id: string;
  fullText: string;
  createdAt: string;          // ISO string
  createdAtDate: Date;
  favoriteCount: number;
  retweetCount: number;
  replyCount: number;
  isRetweet: boolean;
  isReply: boolean;
  inReplyToUserId?: string;
  inReplyToStatusId?: string;
  retweetedStatusId?: string;
  lang?: string;
  hashtags: string[];
  urls: TweetUrl[];
  media: TweetMedia[];
  mentions: TweetMention[];
}

export interface TweetUrl {
  url: string;
  expandedUrl: string;
  displayUrl: string;
}

export interface TweetMedia {
  id: string;
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  localUri?: string;          // URI vers le fichier local dans le ZIP
}

export interface TweetMention {
  id: string;
  screenName: string;
  name: string;
}

export interface Like {
  tweetId: string;
  fullText?: string;
  expandedUrl?: string;
}

export interface ArchiveData {
  user: TwitterUser;
  tweets: Tweet[];
  likes: Like[];
  followersCount: number;
  followingCount: number;
  // Statistiques pré-calculées
  stats: ArchiveStats;
  // Données brutes pour navigation par date
  tweetsByYear: Record<string, Tweet[]>;
  tweetsByYearMonth: Record<string, Record<string, Tweet[]>>;
}

export interface ArchiveStats {
  totalTweets: number;
  totalLikes: number;
  totalRetweets: number;
  totalReplies: number;
  avgFavoritesPerTweet: number;
  mostUsedHashtags: Array<{ tag: string; count: number }>;
  mostActiveDays: Array<{ date: string; count: number }>;
  mostActiveHours: Array<{ hour: number; count: number }>;
  tweetsByYear: Record<string, number>;
  tweetsByMonth: Record<string, number>;
  firstTweetDate?: string;
  lastTweetDate?: string;
  topLanguages: Array<{ lang: string; count: number }>;
}

export interface ParseProgress {
  step: string;
  progress: number;   // 0-100
  detail?: string;
}

export type ProgressCallback = (progress: ParseProgress) => void;

// ─── Erreurs typées ───────────────────────────────────────────────────────────

export class ArchiveParseError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_ZIP'
      | 'NO_TWEETS_FILE'
      | 'PARSE_ERROR'
      | 'READ_ERROR'
      | 'EMPTY_ARCHIVE'
  ) {
    super(message);
    this.name = 'ArchiveParseError';
  }
}

// ─── Utilitaires internes ─────────────────────────────────────────────────────

/**
 * Les fichiers Twitter sont du JS, pas du JSON pur.
 * Ex : "window.YTD.tweets.part0 = [{...}]"
 * On extrait la partie JSON après le premier "= ".
 */
function extractJsonFromTwitterJs(content: string): unknown {
  // Cherche le premier "= " et prend tout ce qui suit
  const eqIndex = content.indexOf('= ');
  if (eqIndex === -1) {
    // Peut-être du JSON pur (certaines archives récentes)
    return JSON.parse(content.trim());
  }
  const jsonStr = content.slice(eqIndex + 2).trim();
  // Retire un éventuel point-virgule final
  const cleaned = jsonStr.endsWith(';') ? jsonStr.slice(0, -1) : jsonStr;
  return JSON.parse(cleaned);
}

/**
 * Lit un fichier texte depuis le ZIP (insensible à la casse du chemin).
 * Retourne null si non trouvé.
 */
async function readZipFile(
  zip: JSZip,
  patterns: string[]
): Promise<string | null> {
  const files = Object.keys(zip.files);

  for (const pattern of patterns) {
    // Recherche exacte d'abord
    const exactMatch = files.find(
      (f) => f.toLowerCase().endsWith(pattern.toLowerCase())
    );
    if (exactMatch && !zip.files[exactMatch].dir) {
      return await zip.files[exactMatch].async('string');
    }
  }
  return null;
}

/**
 * Lit tous les fichiers correspondant à un préfixe (ex: tweets-part*.js)
 */
async function readZipFilesMatching(
  zip: JSZip,
  prefixPattern: string
): Promise<string[]> {
  const files = Object.keys(zip.files);
  const lower = prefixPattern.toLowerCase();
  const matching = files.filter(
    (f) => f.toLowerCase().includes(lower) && !zip.files[f].dir
  );
  const results: string[] = [];
  for (const f of matching) {
    results.push(await zip.files[f].async('string'));
  }
  return results;
}

// ─── Parsers par section ──────────────────────────────────────────────────────

function parseAccount(raw: unknown): Partial<TwitterUser> {
  try {
    // Format: [ { account: { ... } } ]
    const arr = raw as Array<{ account?: Record<string, unknown> }>;
    const acc = arr?.[0]?.account ?? {};
    return {
      id: String(acc.accountId ?? ''),
      username: String(acc.username ?? ''),
      displayName: String(acc.accountDisplayName ?? ''),
      joinDate: String(acc.createdAt ?? ''),
      email: String(acc.email ?? ''),
    } as Partial<TwitterUser> & { email?: string };
  } catch {
    return {};
  }
}

function parseProfile(raw: unknown): Partial<TwitterUser> {
  try {
    // Format: [ { profile: { description: { bio, website, location }, avatarMediaUrl, headerMediaUrl } } ]
    const arr = raw as Array<{ profile?: Record<string, unknown> }>;
    const profile = arr?.[0]?.profile ?? {};
    const desc = (profile.description as Record<string, unknown>) ?? {};
    return {
      bio: String(desc.bio ?? ''),
      website: String(desc.website ?? ''),
      location: String(desc.location ?? ''),
      avatarUrl: String(profile.avatarMediaUrl ?? ''),
      bannerUrl: String(profile.headerMediaUrl ?? ''),
    };
  } catch {
    return {};
  }
}

function parseSingleTweet(rawTweet: Record<string, unknown>): Tweet {
  // Twitter encapsule parfois dans { tweet: { ... } }
  const t = (rawTweet.tweet ?? rawTweet) as Record<string, unknown>;

  const fullText = String(t.full_text ?? t.text ?? '');
  const createdAtStr = String(t.created_at ?? '');
  const createdAtDate = createdAtStr ? new Date(createdAtStr) : new Date(0);

  // Entités
  const entities = (t.entities as Record<string, unknown>) ?? {};
  const extEntities = (t.extended_entities as Record<string, unknown>) ?? {};

  // Hashtags
  const hashtagsRaw = (entities.hashtags as Array<Record<string, unknown>>) ?? [];
  const hashtags = hashtagsRaw.map((h) => String(h.text ?? '').toLowerCase());

  // URLs
  const urlsRaw = (entities.urls as Array<Record<string, unknown>>) ?? [];
  const urls: TweetUrl[] = urlsRaw.map((u) => ({
    url: String(u.url ?? ''),
    expandedUrl: String(u.expanded_url ?? ''),
    displayUrl: String(u.display_url ?? ''),
  }));

  // Médias (préférer extended_entities qui a les vidéos)
  const mediaSource =
    (extEntities.media as Array<Record<string, unknown>>) ??
    (entities.media as Array<Record<string, unknown>>) ??
    [];
  const media: TweetMedia[] = mediaSource.map((m) => {
    const type = String(m.type ?? 'photo');
    // Pour les vidéos, prendre la variante de meilleure qualité
    let url = String(m.media_url_https ?? m.media_url ?? '');
    if (type === 'video' || type === 'animated_gif') {
      const variants =
        (
          (m.video_info as Record<string, unknown>)
            ?.variants as Array<Record<string, unknown>>
        ) ?? [];
      const mp4s = variants.filter((v) => v.content_type === 'video/mp4');
      mp4s.sort(
        (a, b) => Number(b.bitrate ?? 0) - Number(a.bitrate ?? 0)
      );
      if (mp4s.length > 0) {
        url = String(mp4s[0].url ?? url);
      }
    }
    return {
      id: String(m.id_str ?? m.id ?? ''),
      type: (type === 'video'
        ? 'video'
        : type === 'animated_gif'
        ? 'animated_gif'
        : 'photo') as TweetMedia['type'],
      url,
    };
  });

  // Mentions
  const mentionsRaw =
    (entities.user_mentions as Array<Record<string, unknown>>) ?? [];
  const mentions: TweetMention[] = mentionsRaw.map((m) => ({
    id: String(m.id_str ?? ''),
    screenName: String(m.screen_name ?? ''),
    name: String(m.name ?? ''),
  }));

  const retweetedStatusId = t.retweeted_status_id_str
    ? String(t.retweeted_status_id_str)
    : undefined;

  return {
    id: String(t.id_str ?? t.id ?? ''),
    fullText,
    createdAt: createdAtDate.toISOString(),
    createdAtDate,
    favoriteCount: parseInt(String(t.favorite_count ?? '0'), 10) || 0,
    retweetCount: parseInt(String(t.retweet_count ?? '0'), 10) || 0,
    replyCount: parseInt(String(t.reply_count ?? '0'), 10) || 0,
    isRetweet:
      fullText.startsWith('RT @') ||
      retweetedStatusId !== undefined ||
      Boolean(t.retweeted_status),
    isReply: Boolean(t.in_reply_to_status_id_str),
    inReplyToUserId: t.in_reply_to_user_id_str
      ? String(t.in_reply_to_user_id_str)
      : undefined,
    inReplyToStatusId: t.in_reply_to_status_id_str
      ? String(t.in_reply_to_status_id_str)
      : undefined,
    retweetedStatusId,
    lang: t.lang ? String(t.lang) : undefined,
    hashtags,
    urls,
    media,
    mentions,
  };
}

function parseTweets(rawParts: unknown[]): Tweet[] {
  const tweets: Tweet[] = [];
  for (const part of rawParts) {
    const arr = part as Array<Record<string, unknown>>;
    for (const item of arr) {
      try {
        tweets.push(parseSingleTweet(item));
      } catch {
        // On ignore les tweets malformés silencieusement
      }
    }
  }
  return tweets;
}

function parseLikes(raw: unknown): Like[] {
  try {
    const arr = raw as Array<{ like?: Record<string, unknown> }>;
    return arr.map((item) => {
      const like = item.like ?? (item as Record<string, unknown>);
      return {
        tweetId: String(
          (like as Record<string, unknown>).tweetId ??
            (like as Record<string, unknown>).statusId ??
            ''
        ),
        fullText: (like as Record<string, unknown>).fullText
          ? String((like as Record<string, unknown>).fullText)
          : undefined,
        expandedUrl: (like as Record<string, unknown>).expandedUrl
          ? String((like as Record<string, unknown>).expandedUrl)
          : undefined,
      };
    });
  } catch {
    return [];
  }
}

// ─── Calcul des statistiques ──────────────────────────────────────────────────

function computeStats(tweets: Tweet[], likes: Like[]): ArchiveStats {
  const totalTweets = tweets.length;
  const totalLikes = likes.length;

  let totalRetweets = 0;
  let totalReplies = 0;
  let totalFavorites = 0;

  const hashtagCounts: Record<string, number> = {};
  const dayCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  const yearCounts: Record<string, number> = {};
  const monthCounts: Record<string, number> = {};
  const langCounts: Record<string, number> = {};

  let firstDate: Date | undefined;
  let lastDate: Date | undefined;

  for (const tweet of tweets) {
    if (tweet.isRetweet) totalRetweets++;
    if (tweet.isReply) totalReplies++;
    totalFavorites += tweet.favoriteCount;

    const d = tweet.createdAtDate;
    if (!firstDate || d < firstDate) firstDate = d;
    if (!lastDate || d > lastDate) lastDate = d;

    const year = d.getFullYear().toString();
    const month = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const day = d.toISOString().slice(0, 10);
    const hour = d.getHours();

    yearCounts[year] = (yearCounts[year] ?? 0) + 1;
    monthCounts[month] = (monthCounts[month] ?? 0) + 1;
    dayCounts[day] = (dayCounts[day] ?? 0) + 1;
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;

    for (const tag of tweet.hashtags) {
      hashtagCounts[tag] = (hashtagCounts[tag] ?? 0) + 1;
    }

    if (tweet.lang) {
      langCounts[tweet.lang] = (langCounts[tweet.lang] ?? 0) + 1;
    }
  }

  const sortDesc = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]);

  return {
    totalTweets,
    totalLikes,
    totalRetweets,
    totalReplies,
    avgFavoritesPerTweet:
      totalTweets > 0
        ? Math.round((totalFavorites / totalTweets) * 10) / 10
        : 0,
    mostUsedHashtags: sortDesc(hashtagCounts)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count })),
    mostActiveDays: sortDesc(dayCounts)
      .slice(0, 10)
      .map(([date, count]) => ({ date, count })),
    mostActiveHours: Object.entries(hourCounts)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([hour, count]) => ({ hour: Number(hour), count })),
    tweetsByYear: yearCounts,
    tweetsByMonth: monthCounts,
    firstTweetDate: firstDate?.toISOString(),
    lastTweetDate: lastDate?.toISOString(),
    topLanguages: sortDesc(langCounts)
      .slice(0, 10)
      .map(([lang, count]) => ({ lang, count })),
  };
}

// ─── Index par date ───────────────────────────────────────────────────────────

function buildDateIndex(tweets: Tweet[]): {
  tweetsByYear: Record<string, Tweet[]>;
  tweetsByYearMonth: Record<string, Record<string, Tweet[]>>;
} {
  const tweetsByYear: Record<string, Tweet[]> = {};
  const tweetsByYearMonth: Record<string, Record<string, Tweet[]>> = {};

  for (const tweet of tweets) {
    const d = tweet.createdAtDate;
    const year = d.getFullYear().toString();
    const month = String(d.getMonth() + 1).padStart(2, '0');

    if (!tweetsByYear[year]) tweetsByYear[year] = [];
    tweetsByYear[year].push(tweet);

    if (!tweetsByYearMonth[year]) tweetsByYearMonth[year] = {};
    if (!tweetsByYearMonth[year][month]) tweetsByYearMonth[year][month] = [];
    tweetsByYearMonth[year][month].push(tweet);
  }

  // Tri chronologique inversé dans chaque groupe
  for (const year of Object.keys(tweetsByYear)) {
    tweetsByYear[year].sort(
      (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
    );
    for (const month of Object.keys(tweetsByYearMonth[year])) {
      tweetsByYearMonth[year][month].sort(
        (a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime()
      );
    }
  }

  return { tweetsByYear, tweetsByYearMonth };
}

// ─── Fonction principale ──────────────────────────────────────────────────────

/**
 * Parse une archive Twitter ZIP à partir de son URI local (expo-file-system).
 *
 * @param fileUri  URI retourné par expo-document-picker (file://...)
 * @param onProgress  Callback optionnel pour suivre la progression
 * @returns ArchiveData prêt à être stocké dans archiveStore
 */
export async function parseTwitterArchive(
  fileUri: string,
  onProgress?: ProgressCallback
): Promise<ArchiveData> {
  const report = (step: string, progress: number, detail?: string) => {
    onProgress?.({ step, progress, detail });
  };

  // 1. Lecture du fichier ZIP
  report('Lecture du fichier ZIP…', 5);
  let zipData: Uint8Array;
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Convertir base64 → Uint8Array
    const binary = atob(base64);
    zipData = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      zipData[i] = binary.charCodeAt(i);
    }
  } catch (err) {
    throw new ArchiveParseError(
      `Impossible de lire le fichier : ${String(err)}`,
      'READ_ERROR'
    );
  }

  // 2. Décompression
  report('Décompression du ZIP…', 15);
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(zipData);
  } catch (err) {
    throw new ArchiveParseError(
      `Le fichier ne semble pas être un ZIP valide : ${String(err)}`,
      'INVALID_ZIP'
    );
  }

  // Lister les fichiers pour debug
  const allFiles = Object.keys(zip.files).filter((f) => !zip.files[f].dir);
  if (allFiles.length === 0) {
    throw new ArchiveParseError(
      'Le ZIP est vide ou ne contient aucun fichier.',
      'EMPTY_ARCHIVE'
    );
  }

  // 3. Lecture du compte
  report('Lecture des informations du compte…', 25);
  const accountRaw = await readZipFile(zip, [
    'data/account.js',
    'account.js',
  ]);
  let userPartial: Partial<TwitterUser> = {};
  if (accountRaw) {
    try {
      userPartial = {
        ...userPartial,
        ...parseAccount(extractJsonFromTwitterJs(accountRaw)),
      };
    } catch {
      // Non bloquant
    }
  }

  // 4. Lecture du profil
  report('Lecture du profil…', 30);
  const profileRaw = await readZipFile(zip, [
    'data/profile.js',
    'profile.js',
  ]);
  if (profileRaw) {
    try {
      userPartial = {
        ...userPartial,
        ...parseProfile(extractJsonFromTwitterJs(profileRaw)),
      };
    } catch {
      // Non bloquant
    }
  }

  // 5. Lecture des tweets (peut être multipart)
  report('Lecture des tweets…', 40);

  // Cherche tweet.js, tweets.js, et toutes les parties
  const tweetFileContents: string[] = [];

  // Fichier principal
  const mainTweetFile = await readZipFile(zip, [
    'data/tweets.js',
    'data/tweet.js',
    'tweets.js',
    'tweet.js',
  ]);
  if (mainTweetFile) tweetFileContents.push(mainTweetFile);

  // Parties supplémentaires (tweets-part2.js, tweets-part3.js, etc.)
  const additionalParts = await readZipFilesMatching(zip, 'tweets-part');
  tweetFileContents.push(...additionalParts);

  if (tweetFileContents.length === 0) {
    throw new ArchiveParseError(
      "Aucun fichier de tweets trouvé dans l'archive. Vérifiez qu'il s'agit bien d'une archive Twitter/X officielle.",
      'NO_TWEETS_FILE'
    );
  }

  // 6. Parsing des tweets
  report('Analyse des tweets…', 55);
  let parsedParts: unknown[];
  try {
    parsedParts = tweetFileContents.map((content) =>
      extractJsonFromTwitterJs(content)
    );
  } catch (err) {
    throw new ArchiveParseError(
      `Erreur lors du parsing des tweets : ${String(err)}`,
      'PARSE_ERROR'
    );
  }

  const tweets = parseTweets(parsedParts);
  report('Analyse des tweets…', 65, `${tweets.length} tweets trouvés`);

  if (tweets.length === 0) {
    throw new ArchiveParseError(
      "L'archive ne contient aucun tweet valide.",
      'EMPTY_ARCHIVE'
    );
  }

  // 7. Likes
  report('Lecture des likes…', 70);
  const likesRaw = await readZipFile(zip, [
    'data/like.js',
    'data/likes.js',
    'like.js',
    'likes.js',
  ]);
  const likes = likesRaw
    ? (() => {
        try {
          return parseLikes(extractJsonFromTwitterJs(likesRaw));
        } catch {
          return [];
        }
      })()
    : [];

  // 8. Followers / Following (comptes uniquement, pour le nombre)
  report('Lecture des abonnements…', 75);
  const followersRaw = await readZipFile(zip, [
    'data/follower.js',
    'data/followers.js',
    'follower.js',
  ]);
  const followingRaw = await readZipFile(zip, [
    'data/following.js',
    'following.js',
  ]);

  let followersCount = 0;
  let followingCount = 0;
  if (followersRaw) {
    try {
      const arr = extractJsonFromTwitterJs(followersRaw) as unknown[];
      followersCount = arr.length;
    } catch {
      /* ok */
    }
  }
  if (followingRaw) {
    try {
      const arr = extractJsonFromTwitterJs(followingRaw) as unknown[];
      followingCount = arr.length;
    } catch {
      /* ok */
    }
  }

  // 9. Calcul des statistiques
  report('Calcul des statistiques…', 85);
  const stats = computeStats(tweets, likes);

  // 10. Index par date
  report('Construction de l\'index temporel…', 92);
  const { tweetsByYear, tweetsByYearMonth } = buildDateIndex(tweets);

  // 11. Construction de l'utilisateur final
  const user: TwitterUser = {
    id: userPartial.id ?? '',
    username: userPartial.username ?? 'Inconnu',
    displayName: userPartial.displayName ?? userPartial.username ?? 'Inconnu',
    bio: userPartial.bio ?? '',
    location: userPartial.location ?? '',
    website: userPartial.website ?? '',
    joinDate: userPartial.joinDate ?? '',
    avatarUrl: userPartial.avatarUrl,
    bannerUrl: userPartial.bannerUrl,
    followersCount,
    followingCount,
    tweetCount: tweets.length,
  };

  report('Terminé !', 100, `Archive de @${user.username} chargée`);

  return {
    user,
    tweets,
    likes,
    followersCount,
    followingCount,
    stats,
    tweetsByYear,
    tweetsByYearMonth,
  };
}

/**
 * Vérifie rapidement si un ZIP ressemble à une archive Twitter
 * sans le parser entièrement (utile pour valider avant d'importer).
 */
export async function validateTwitterArchiveZip(
  fileUri: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binary = atob(base64);
    const zipData = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      zipData[i] = binary.charCodeAt(i);
    }
    const zip = await JSZip.loadAsync(zipData);
    const files = Object.keys(zip.files).map((f) => f.toLowerCase());

    const hasTweets = files.some(
      (f) =>
        f.includes('tweet.js') ||
        f.includes('tweets.js') ||
        f.includes('tweets-part')
    );
    if (!hasTweets) {
      return {
        valid: false,
        reason:
          "Aucun fichier de tweets détecté. Ce ZIP n'est peut-être pas une archive Twitter/X officielle.",
      };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Impossible de lire ou décompresser le fichier.' };
  }
}
