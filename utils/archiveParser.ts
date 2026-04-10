/**
 * archiveParser.ts
 * Parsing complet des archives Twitter/X au format ZIP.
 *
 * STRATÉGIE MÉMOIRE :
 * On utilise react-native-zip-archive pour extraire le ZIP
 * directement sur le système de fichiers (natif Java/Kotlin),
 * sans jamais charger le ZIP en RAM. Cela permet de traiter
 * des archives de plusieurs GB sans OutOfMemoryError.
 *
 * Flux :
 *   1. ZIP (disque) → extraction native → dossier temporaire (disque)
 *   2. Lecture séquentielle des fichiers .js nécessaires
 *   3. Parsing JSON + construction ArchiveData
 *   4. Nettoyage du dossier temporaire
 *
 * Sur web : on garde l'approche ArrayBuffer (archives plus petites
 * et contraintes différentes).
 */

import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive';
import { Platform } from 'react-native';
import type { ArchiveData, Tweet, DayData, MonthData, YearData } from '@/types/twitter';

export type ArchiveInput = ArrayBuffer | string; // string = fileUri natif

// ─── Utilitaires JSON ──────────────────────────────────────────────────────────

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

// ─── Lecture de fichiers extraits ─────────────────────────────────────────────

/**
 * Cherche et lit le premier fichier correspondant à l'un des suffixes
 * dans le dossier d'extraction. Retourne null si non trouvé.
 */
async function readFirstExtracted(
  extractDir: string,
  suffixes: string[]
): Promise<string | null> {
  try {
    // Lister récursivement les fichiers du dossier extrait
    const allFiles = await listFilesRecursive(extractDir);
    for (const suffix of suffixes) {
      const match = allFiles.find((f) =>
        f.toLowerCase().endsWith(suffix.toLowerCase())
      );
      if (match) {
        return await FileSystem.readAsStringAsync(match, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Lit tous les fichiers contenant le fragment dans leur chemin.
 */
async function readAllExtracted(
  extractDir: string,
  fragment: string
): Promise<string[]> {
  try {
    const allFiles = await listFilesRecursive(extractDir);
    const matches = allFiles.filter((f) =>
      f.toLowerCase().includes(fragment.toLowerCase())
    );
    const results: string[] = [];
    for (const file of matches) {
      try {
        const content = await FileSystem.readAsStringAsync(file, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        results.push(content);
      } catch { /* fichier illisible ignoré */ }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Liste récursivement tous les fichiers d'un dossier.
 */
async function listFilesRecursive(dir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await FileSystem.readDirectoryAsync(dir);
    for (const entry of entries) {
      const fullPath = `${dir}/${entry}`;
      const info = await FileSystem.getInfoAsync(fullPath);
      if (info.isDirectory) {
        const subFiles = await listFilesRecursive(fullPath);
        results.push(...subFiles);
      } else {
        results.push(fullPath);
      }
    }
  } catch { /* dossier illisible ignoré */ }
  return results;
}

// ─── Parsers de sections ──────────────────────────────────────────────────────

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

function parseSingleTweet(
  raw: Record<string, unknown>,
  account: AccountInfo
): Tweet {
  const t = (raw.tweet ?? raw) as Record<string, unknown>;
  const text = String(t.full_text ?? t.text ?? '');
  const createdAtStr = String(t.created_at ?? '');
  const createdAt = createdAtStr
    ? new Date(createdAtStr).toISOString()
    : new Date(0).toISOString();

  const entities = (t.entities as Record<string, unknown>) ?? {};
  const extEntities = (t.extended_entities as Record<string, unknown>) ?? {};

  const mediaSource: Array<Record<string, unknown>> =
    (extEntities.media as Array<Record<string, unknown>>) ??
    (entities.media as Array<Record<string, unknown>>) ??
    [];

  const media: Tweet['media'] = mediaSource
    .map((m) => {
      const rawType = String(m.type ?? 'photo');
      const type: 'photo' | 'video' =
        rawType === 'video' || rawType === 'animated_gif' ? 'video' : 'photo';
      let url = String(m.media_url_https ?? m.media_url ?? '');
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

// ─── Construction YearData[] ──────────────────────────────────────────────────

function buildYearStructure(tweets: Tweet[]): YearData[] {
  const byYear: Record<
    string,
    Record<string, Record<string, Tweet[]>>
  > = {};

  for (const tweet of tweets) {
    const d = new Date(tweet.created_at);
    const year = d.getFullYear().toString();
    const month = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const day = d.toISOString().slice(0, 10);
    ((byYear[year] ??= {})[month] ??= {})[day] ??= [];
    byYear[year][month][day].push(tweet);
  }

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
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
              return {
                date,
                tweetCount: dayTweets.length,
                tweets: dayTweets,
              };
            });
          return {
            month,
            tweetCount: days.reduce((s, d) => s + d.tweetCount, 0),
            days,
          };
        });
      return {
        year,
        tweetCount: months.reduce((s, m) => s + m.tweetCount, 0),
        months,
      };
    });
}

// ─── Parsing depuis dossier extrait ───────────────────────────────────────────

async function parseFromExtractedDir(extractDir: string): Promise<ArchiveData> {
  // Compte + profil
  let account: AccountInfo = {
    username: 'unknown',
    displayName: 'Unknown',
    avatarUrl: '',
    bio: '',
  };
  const accountRaw = await readFirstExtracted(extractDir, [
    'data/account.js',
    'account.js',
  ]);
  if (accountRaw) {
    try {
      account = parseAccountInfo(extractJson(accountRaw));
    } catch { /**/ }
  }
  const profileRaw = await readFirstExtracted(extractDir, [
    'data/profile.js',
    'profile.js',
  ]);
  if (profileRaw) {
    try {
      account = parseProfileInfo(extractJson(profileRaw), account);
    } catch { /**/ }
  }

  // Tweets — fichier principal + parties multipart
  const tweetContents: string[] = [];
  const mainFile = await readFirstExtracted(extractDir, [
    'data/tweets.js',
    'data/tweet.js',
    'tweets.js',
    'tweet.js',
  ]);
  if (mainFile) tweetContents.push(mainFile);
  const extraParts = await readAllExtracted(extractDir, 'tweets-part');
  tweetContents.push(...extraParts);

  if (tweetContents.length === 0) {
    throw new Error(
      "Aucun fichier de tweets trouvé. Assurez-vous d'utiliser une archive Twitter/X officielle."
    );
  }

  // Parsing tweet par tweet
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
      } catch { /* tweet malformé ignoré */ }
    }
  }

  if (tweets.length === 0) {
    throw new Error("L'archive ne contient aucun tweet valide.");
  }

  return {
    years: buildYearStructure(tweets),
    totalTweets: tweets.length,
  };
}

// ─── Parsing web (ArrayBuffer) ────────────────────────────────────────────────

async function parseFromArrayBuffer(buffer: ArrayBuffer): Promise<ArchiveData> {
  // Sur web, JSZip reste la bonne approche (pas de système de fichiers natif)
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buffer);

  const readFirst = async (suffixes: string[]): Promise<string | null> => {
    const keys = Object.keys(zip.files);
    for (const suffix of suffixes) {
      const match = keys.find(
        (k) =>
          k.toLowerCase().endsWith(suffix.toLowerCase()) && !zip.files[k].dir
      );
      if (match) return zip.files[match].async('string');
    }
    return null;
  };

  const readAll = async (fragment: string): Promise<string[]> => {
    const keys = Object.keys(zip.files);
    const matches = keys.filter(
      (k) =>
        k.toLowerCase().includes(fragment.toLowerCase()) && !zip.files[k].dir
    );
    return Promise.all(matches.map((k) => zip.files[k].async('string')));
  };

  let account: AccountInfo = {
    username: 'unknown',
    displayName: 'Unknown',
    avatarUrl: '',
    bio: '',
  };
  const accountRaw = await readFirst(['data/account.js', 'account.js']);
  if (accountRaw) {
    try { account = parseAccountInfo(extractJson(accountRaw)); } catch { /**/ }
  }
  const profileRaw = await readFirst(['data/profile.js', 'profile.js']);
  if (profileRaw) {
    try { account = parseProfileInfo(extractJson(profileRaw), account); } catch { /**/ }
  }

  const tweetContents: string[] = [];
  const mainFile = await readFirst([
    'data/tweets.js', 'data/tweet.js', 'tweets.js', 'tweet.js',
  ]);
  if (mainFile) tweetContents.push(mainFile);
  const extraParts = await readAll('tweets-part');
  tweetContents.push(...extraParts);

  if (tweetContents.length === 0) {
    throw new Error(
      "Aucun fichier de tweets trouvé. Assurez-vous d'utiliser une archive Twitter/X officielle."
    );
  }

  const tweets: Tweet[] = [];
  for (const content of tweetContents) {
    let parsed: unknown;
    try { parsed = extractJson(content); } catch (err) {
      throw new Error(`Erreur de parsing des tweets : ${String(err)}`);
    }
    for (const item of parsed as Array<Record<string, unknown>>) {
      try { tweets.push(parseSingleTweet(item, account)); } catch { /**/ }
    }
  }

  if (tweets.length === 0) {
    throw new Error("L'archive ne contient aucun tweet valide.");
  }

  return {
    years: buildYearStructure(tweets),
    totalTweets: tweets.length,
  };
}

// ─── API publique ─────────────────────────────────────────────────────────────

export async function validateTwitterArchive(
  input: ArchiveInput
): Promise<{ valid: boolean; message?: string }> {
  // Validation légère : on vérifie juste l'extension du fichier
  // pour éviter de charger quoi que ce soit en mémoire
  if (typeof input === 'string') {
    const lower = input.toLowerCase();
    if (!lower.endsWith('.zip')) {
      return {
        valid: false,
        message:
          "Le fichier doit être un ZIP. Vérifiez qu'il s'agit d'une archive Twitter/X officielle.",
      };
    }
    // Vérifier que le fichier existe
    const info = await FileSystem.getInfoAsync(input);
    if (!info.exists) {
      return { valid: false, message: 'Fichier introuvable.' };
    }
    return { valid: true };
  }

  // Web : validation rapide via JSZip
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(input);
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

export async function parseTwitterArchive(
  input: ArchiveInput
): Promise<ArchiveData> {
  // ── Web : ArrayBuffer via JSZip ──
  if (typeof input !== 'string' || Platform.OS === 'web') {
    if (typeof input !== 'string') {
      return parseFromArrayBuffer(input);
    }
    throw new Error('fileUri non supporté sur web.');
  }

  // ── Natif : extraction sur disque via react-native-zip-archive ──
  const extractDir =
    `${FileSystem.cacheDirectory}twarex-extract-${Date.now()}`;

  try {
    // Créer le dossier de destination
    await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });

    // Extraction native — ne charge jamais le ZIP en RAM JS
    await unzip(input, extractDir);

    // Parser depuis les fichiers extraits
    const result = await parseFromExtractedDir(extractDir);

    return result;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : `Erreur inattendue : ${String(err)}`
    );
  } finally {
    // Nettoyage systématique du dossier temporaire
    try {
      await FileSystem.deleteAsync(extractDir, { idempotent: true });
    } catch { /**/ }
  }
}
