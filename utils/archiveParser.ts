/**
 * archiveParser.ts
 * Parsing complet des archives Twitter/X au format ZIP.
 *
 * Produit exactement le type ArchiveData défini dans @/types/twitter :
 *   { years: YearData[], totalTweets: number }
 *
 * Compatible avec l'interface de archive-settings.tsx :
 *   validateTwitterArchive(input) → { valid, message? }
 *   parseTwitterArchive(input)    → ArchiveData
 *
 * "input" accepte :
 *   - ArrayBuffer  (web, via FileReader)
 *   - string       (fileUri natif Expo, non utilisé dans le flux actuel
 *                   mais conservé pour usage futur)
 */

import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import type { ArchiveData, Tweet, DayData, MonthData, YearData } from '@/types/twitter';

export type ArchiveInput = ArrayBuffer | string;

// ─── Chargement du ZIP ─────────────────────────────────────────────────────────

async function loadZip(input: ArchiveInput): Promise<JSZip> {
  let buffer: ArrayBuffer;

  if (typeof input === 'string') {
    if (Platform.OS === 'web') {
      throw new Error('fileUri non supporté sur web — utilisez ArrayBuffer.');
    }
    const base64 = await FileSystem.readAsStringAsync(input, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    buffer = bytes.buffer;
  } else {
    buffer = input;
  }

  return JSZip.loadAsync(buffer);
}

// ─── Utilitaires ZIP ───────────────────────────────────────────────────────────

/**
 * Les fichiers Twitter sont du JS, pas du JSON pur.
 * Format : "window.YTD.tweets.part0 = [{...}]"
 * On extrait la partie après le premier "= ".
 */
function extractJson(content: string): unknown {
  const eq = content.indexOf('= ');
  if (eq === -1) return JSON.parse(content.trim());
  const raw = content.slice(eq + 2).trim();
  return JSON.parse(raw.endsWith(';') ? raw.slice(0, -1) : raw);
}

/** Lit le premier fichier dont le chemin se termine par l'un des suffixes (insensible à la casse). */
async function readFirst(zip: JSZip, suffixes: string[]): Promise<string | null> {
  const keys = Object.keys(zip.files);
  for (const suffix of suffixes) {
    const match = keys.find(
      (k) => k.toLowerCase().endsWith(suffix.toLowerCase()) && !zip.files[k].dir
    );
    if (match) return zip.files[match].async('string');
  }
  return null;
}

/** Lit tous les fichiers dont le chemin contient le fragment donné. */
async function readAll(zip: JSZip, fragment: string): Promise<string[]> {
  const keys = Object.keys(zip.files);
  const matches = keys.filter(
    (k) => k.toLowerCase().includes(fragment.toLowerCase()) && !zip.files[k].dir
  );
  return Promise.all(matches.map((k) => zip.files[k].async('string')));
}

// ─── Parser de compte (pour récupérer username/displayName) ───────────────────

interface AccountInfo {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
}

function parseAccountInfo(raw: unknown): AccountInfo {
  try {
    const arr = raw as Array<{ account?: Record<string, unknown> }>;
    const acc = (arr?.[0]?.account ?? {}) as Record<string, unknown>;
    return {
      username: String(acc.username ?? 'unknown'),
      displayName: String(acc.accountDisplayName ?? acc.username ?? 'Unknown'),
      avatarUrl: '',
      bio: '',
    };
  } catch {
    return { username: 'unknown', displayName: 'Unknown', avatarUrl: '', bio: '' };
  }
}

function parseProfileInfo(raw: unknown, info: AccountInfo): AccountInfo {
  try {
    const arr = raw as Array<{ profile?: Record<string, unknown> }>;
    const p = (arr?.[0]?.profile ?? {}) as Record<string, unknown>;
    const desc = (p.description as Record<string, unknown>) ?? {};
    return {
      ...info,
      bio: String(desc.bio ?? ''),
      avatarUrl: String(p.avatarMediaUrl ?? ''),
    };
  } catch {
    return info;
  }
}

// ─── Parser de tweet individuel → Tweet (types/twitter.ts) ────────────────────

function parseSingleTweet(raw: Record<string, unknown>, account: AccountInfo): Tweet {
  // Twitter encapsule parfois dans { tweet: { ... } }
  const t = (raw.tweet ?? raw) as Record<string, unknown>;

  const text = String(t.full_text ?? t.text ?? '');
  const createdAtStr = String(t.created_at ?? '');
  const createdAt = createdAtStr ? new Date(createdAtStr).toISOString() : new Date(0).toISOString();

  // Médias — préférer extended_entities (inclut les vidéos)
  const entities = (t.entities as Record<string, unknown>) ?? {};
  const extEntities = (t.extended_entities as Record<string, unknown>) ?? {};
  const mediaSource: Array<Record<string, unknown>> =
    (extEntities.media as Array<Record<string, unknown>>) ??
    (entities.media as Array<Record<string, unknown>>) ?? [];

  const media: Tweet['media'] = mediaSource
    .map((m) => {
      const rawType = String(m.type ?? 'photo');
      const type: 'photo' | 'video' = rawType === 'video' || rawType === 'animated_gif'
        ? 'video' : 'photo';

      let url = String(m.media_url_https ?? m.media_url ?? '');

      // Pour les vidéos, prendre la variante MP4 de meilleure qualité
      if (rawType === 'video' || rawType === 'animated_gif') {
        const variants =
          ((m.video_info as Record<string, unknown>)
            ?.variants as Array<Record<string, unknown>>) ?? [];
        const mp4s = variants
          .filter((v) => v.content_type === 'video/mp4')
          .sort((a, b) => Number(b.bitrate ?? 0) - Number(a.bitrate ?? 0));
        if (mp4s.length) url = String(mp4s[0].url ?? url);
      }

      return { type, url };
    })
    .filter((m) => m.url.length > 0);

  return {
    id: String(t.id_str ?? t.id ?? ''),
    text,
    created_at: createdAt,
    favorite_count: parseInt(String(t.favorite_count ?? '0'), 10) || 0,
    retweet_count: parseInt(String(t.retweet_count ?? '0'), 10) || 0,
    media: media.length > 0 ? media : undefined,
    user: {
      name: account.displayName,
      screen_name: account.username,
      profile_image_url: account.avatarUrl,
      bio: account.bio,
    },
  };
}

// ─── Construction de la structure YearData[] ──────────────────────────────────

function buildYearStructure(tweets: Tweet[]): YearData[] {
  // Grouper par année > mois > jour
  const byYear: Record<string, Record<string, Record<string, Tweet[]>>> = {};

  for (const tweet of tweets) {
    const d = new Date(tweet.created_at);
    const year = d.getFullYear().toString();
    const month = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const day = d.toISOString().slice(0, 10); // YYYY-MM-DD

    ((byYear[year] ??= {})[month] ??= {})[day] ??= [];
    byYear[year][month][day].push(tweet);
  }

  // Convertir en YearData[] trié chronologiquement inversé (plus récent en premier)
  return Object.keys(byYear)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => {
      const months: MonthData[] = Object.keys(byYear[year])
        .sort((a, b) => b.localeCompare(a))
        .map((month) => {
          const days: DayData[] = Object.keys(byYear[year][month])
            .sort((a, b) => b.localeCompare(a))
            .map((date) => {
              const dayTweets = byYear[year][month][date].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              return {
                date,
                tweetCount: dayTweets.length,
                tweets: dayTweets,
              };
            });

          return {
            month,
            tweetCount: days.reduce((sum, d) => sum + d.tweetCount, 0),
            days,
          };
        });

      return {
        year,
        tweetCount: months.reduce((sum, m) => sum + m.tweetCount, 0),
        months,
      };
    });
}

// ─── API publique ──────────────────────────────────────────────────────────────

/**
 * Vérifie rapidement si le ZIP est une archive Twitter valide.
 */
export async function validateTwitterArchive(
  input: ArchiveInput
): Promise<{ valid: boolean; message?: string }> {
  try {
    const zip = await loadZip(input);
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
        message:
          "Aucun fichier de tweets détecté. Vérifiez qu'il s'agit d'une archive Twitter/X officielle.",
      };
    }
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      message: `Impossible de lire le fichier ZIP : ${String(err)}`,
    };
  }
}

/**
 * Parse complètement une archive Twitter ZIP.
 * Retourne exactement le type ArchiveData de @/types/twitter.
 */
export async function parseTwitterArchive(input: ArchiveInput): Promise<ArchiveData> {
  // 1. Décompression
  let zip: JSZip;
  try {
    zip = await loadZip(input);
  } catch (err) {
    throw new Error(`Impossible de décompresser le fichier : ${String(err)}`);
  }

  const allFiles = Object.keys(zip.files).filter((f) => !zip.files[f].dir);
  if (allFiles.length === 0) {
    throw new Error('Le ZIP est vide.');
  }

  // 2. Informations du compte (pour remplir Tweet.user)
  let account: AccountInfo = { username: 'unknown', displayName: 'Unknown', avatarUrl: '', bio: '' };
  const accountRaw = await readFirst(zip, ['data/account.js', 'account.js']);
  if (accountRaw) {
    try { account = parseAccountInfo(extractJson(accountRaw)); } catch { /**/ }
  }
  const profileRaw = await readFirst(zip, ['data/profile.js', 'profile.js']);
  if (profileRaw) {
    try { account = parseProfileInfo(extractJson(profileRaw), account); } catch { /**/ }
  }

  // 3. Tweets — fichier principal + parties supplémentaires (archives volumineuses)
  const tweetContents: string[] = [];
  const mainFile = await readFirst(zip, [
    'data/tweets.js',
    'data/tweet.js',
    'tweets.js',
    'tweet.js',
  ]);
  if (mainFile) tweetContents.push(mainFile);

  // tweets-part2.js, tweets-part3.js, etc.
  const extraParts = await readAll(zip, 'tweets-part');
  tweetContents.push(...extraParts);

  if (tweetContents.length === 0) {
    throw new Error(
      "Aucun fichier de tweets trouvé dans l'archive. " +
        "Assurez-vous d'utiliser une archive Twitter/X officielle."
    );
  }

  // 4. Parsing
  const tweets: Tweet[] = [];
  for (const content of tweetContents) {
    let parsed: unknown;
    try {
      parsed = extractJson(content);
    } catch (err) {
      throw new Error(`Erreur de parsing des tweets : ${String(err)}`);
    }
    for (const item of parsed as Array<Record<string, unknown>>) {
      try {
        tweets.push(parseSingleTweet(item, account));
      } catch {
        // tweet malformé ignoré silencieusement
      }
    }
  }

  if (tweets.length === 0) {
    throw new Error("L'archive ne contient aucun tweet valide.");
  }

  // 5. Construction de la structure hiérarchique YearData[]
  const years = buildYearStructure(tweets);

  return {
    years,
    totalTweets: tweets.length,
  };
}
