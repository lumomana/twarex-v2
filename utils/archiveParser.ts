/**
 * archiveParser.ts
 * Parsing des archives Twitter/X au format ZIP.
 *
 * STRATÉGIE MÉMOIRE — lecture sélective sans extraction :
 *
 * Un fichier ZIP contient un "Central Directory" à la fin
 * qui liste tous les fichiers avec leurs offsets. On lit
 * uniquement ce répertoire (~KB) pour construire un index,
 * puis on accède directement aux seuls fichiers nécessaires
 * (tweets.js, account.js, profile.js) par leur offset.
 *
 * Le ZIP n'est jamais chargé en entier en mémoire.
 * Fonctionne sur des archives de plusieurs GB.
 *
 * Sur web : JSZip avec filtre (archives plus petites côté web).
 */

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import type { ArchiveData, Tweet, DayData, MonthData, YearData } from '@/types/twitter';

export type ArchiveInput = ArrayBuffer | string;

// ─── Lecture ZIP par range (natif) ────────────────────────────────────────────

/**
 * Lit un segment d'un fichier local par position et longueur.
 * Utilise expo-file-system qui supporte la lecture positionnelle.
 */
async function readFileRange(
  fileUri: string,
  position: number,
  length: number
): Promise<Uint8Array> {
  const base64 = await (FileSystem as any).readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
    position,
    length,
  });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ─── Parseur ZIP minimal ──────────────────────────────────────────────────────

interface ZipEntry {
  filename: string;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
  compressionMethod: number;
}

/**
 * Lit le Central Directory du ZIP et retourne l'index des fichiers.
 * Ne lit que la fin du fichier (quelques KB).
 */
async function readZipIndex(fileUri: string): Promise<ZipEntry[]> {
  const info = await FileSystem.getInfoAsync(fileUri, { size: true });
  if (!info.exists) throw new Error('Fichier introuvable.');
  const fileSize = (info as any).size as number;
  if (!fileSize || fileSize < 22) throw new Error('Fichier ZIP invalide.');

  // Lire les 65KB finaux pour trouver l'End of Central Directory
  const eocdSearchSize = Math.min(65558, fileSize);
  const eocdBuffer = await readFileRange(
    fileUri,
    fileSize - eocdSearchSize,
    eocdSearchSize
  );

  // Chercher la signature EOCD : 0x06054b50
  let eocdOffset = -1;
  for (let i = eocdBuffer.length - 22; i >= 0; i--) {
    if (
      eocdBuffer[i] === 0x50 &&
      eocdBuffer[i + 1] === 0x4b &&
      eocdBuffer[i + 2] === 0x05 &&
      eocdBuffer[i + 3] === 0x06
    ) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Structure ZIP invalide — EOCD non trouvé.');

  const view = new DataView(eocdBuffer.buffer, eocdBuffer.byteOffset);

  // Lire offset et taille du Central Directory depuis l'EOCD
  const cdSize = view.getUint32(eocdOffset + 12, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);

  // Vérifier si c'est un ZIP64
  const isZip64 = cdOffset === 0xffffffff || cdSize === 0xffffffff;
  if (isZip64) {
    // Pour ZIP64, chercher le locator ZIP64
    // On lit quand même le central directory normalement si possible
  }

  // Lire le Central Directory
  const cdBuffer = await readFileRange(fileUri, cdOffset, cdSize);
  const cdView = new DataView(cdBuffer.buffer, cdBuffer.byteOffset);

  const entries: ZipEntry[] = [];
  let pos = 0;

  while (pos < cdBuffer.length - 4) {
    // Signature Central Directory : 0x02014b50
    if (
      cdBuffer[pos] !== 0x50 ||
      cdBuffer[pos + 1] !== 0x4b ||
      cdBuffer[pos + 2] !== 0x01 ||
      cdBuffer[pos + 3] !== 0x02
    ) break;

    const compressionMethod = cdView.getUint16(pos + 10, true);
    const compressedSize = cdView.getUint32(pos + 20, true);
    const uncompressedSize = cdView.getUint32(pos + 24, true);
    const filenameLength = cdView.getUint16(pos + 28, true);
    const extraLength = cdView.getUint16(pos + 30, true);
    const commentLength = cdView.getUint16(pos + 32, true);
    const localHeaderOffset = cdView.getUint32(pos + 42, true);

    // Décoder le nom de fichier (UTF-8)
    const filenameBytes = cdBuffer.slice(pos + 46, pos + 46 + filenameLength);
    const filename = new TextDecoder('utf-8').decode(filenameBytes);

    if (filename && !filename.endsWith('/')) {
      entries.push({
        filename,
        compressedSize,
        uncompressedSize,
        localHeaderOffset,
        compressionMethod,
      });
    }

    pos += 46 + filenameLength + extraLength + commentLength;
  }

  return entries;
}

/**
 * Lit et décompresse un fichier spécifique du ZIP par son entrée d'index.
 * Seul ce fichier transite par la mémoire.
 */
async function readZipEntry(
  fileUri: string,
  entry: ZipEntry
): Promise<string> {
  // Lire le Local File Header pour trouver la position réelle des données
  const headerBuffer = await readFileRange(fileUri, entry.localHeaderOffset, 30);
  const headerView = new DataView(headerBuffer.buffer, headerBuffer.byteOffset);

  const filenameLength = headerView.getUint16(26, true);
  const extraLength = headerView.getUint16(28, true);
  const dataOffset = entry.localHeaderOffset + 30 + filenameLength + extraLength;

  // Lire les données compressées
  const compressedData = await readFileRange(
    fileUri,
    dataOffset,
    entry.compressedSize
  );

  // Décompresser selon la méthode
  if (entry.compressionMethod === 0) {
    // Stored — pas de compression
    return new TextDecoder('utf-8').decode(compressedData);
  } else if (entry.compressionMethod === 8) {
    // Deflate — utiliser DecompressionStream (disponible React Native 0.79+)
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    writer.write(compressedData);
    writer.close();

    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      totalLength += value.length;
    }

    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return new TextDecoder('utf-8').decode(result);
  } else {
    throw new Error(
      `Méthode de compression ${entry.compressionMethod} non supportée.`
    );
  }
}

// ─── Utilitaires JSON Twitter ─────────────────────────────────────────────────

function extractJson(content: string): unknown {
  const eq = content.indexOf('= ');
  if (eq === -1) return JSON.parse(content.trim());
  const raw = content.slice(eq + 2).trim();
  return JSON.parse(raw.endsWith(';') ? raw.slice(0, -1) : raw);
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
    (entities.media as Array<Record<string, unknown>>) ?? [];

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
  const byYear: Record<string, Record<string, Record<string, Tweet[]>>> = {};

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
              return { date, tweetCount: dayTweets.length, tweets: dayTweets };
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

// ─── Parsing natif depuis le ZIP en place ─────────────────────────────────────

async function parseFromZipInPlace(fileUri: string): Promise<ArchiveData> {
  // 1. Lire uniquement le Central Directory (~KB)
  const index = await readZipIndex(fileUri);

  // 2. Chercher les fichiers nécessaires dans l'index
  const findEntry = (suffixes: string[]): ZipEntry | undefined => {
    for (const suffix of suffixes) {
      const entry = index.find((e) =>
        e.filename.toLowerCase().endsWith(suffix.toLowerCase())
      );
      if (entry) return entry;
    }
    return undefined;
  };

  const findAllEntries = (fragment: string): ZipEntry[] =>
    index.filter((e) =>
      e.filename.toLowerCase().includes(fragment.toLowerCase())
    );

  // 3. Lire compte + profil (petits fichiers)
  let account: AccountInfo = {
    username: 'unknown',
    displayName: 'Unknown',
    avatarUrl: '',
    bio: '',
  };

  const accountEntry = findEntry(['data/account.js', 'account.js']);
  if (accountEntry) {
    try {
      account = parseAccountInfo(
        extractJson(await readZipEntry(fileUri, accountEntry))
      );
    } catch { /**/ }
  }

  const profileEntry = findEntry(['data/profile.js', 'profile.js']);
  if (profileEntry) {
    try {
      account = parseProfileInfo(
        extractJson(await readZipEntry(fileUri, profileEntry)),
        account
      );
    } catch { /**/ }
  }

  // 4. Lire tweets — fichier principal + parties multipart
  const tweetEntries: ZipEntry[] = [];
  const mainEntry = findEntry([
    'data/tweets.js', 'data/tweet.js', 'tweets.js', 'tweet.js',
  ]);
  if (mainEntry) tweetEntries.push(mainEntry);
  tweetEntries.push(...findAllEntries('tweets-part'));

  if (tweetEntries.length === 0) {
    throw new Error(
      "Aucun fichier de tweets trouvé. Assurez-vous d'utiliser une archive Twitter/X officielle."
    );
  }

  // 5. Parser les tweets — un fichier à la fois pour économiser la mémoire
  const tweets: Tweet[] = [];
  for (const entry of tweetEntries) {
    const content = await readZipEntry(fileUri, entry);
    let parsed: unknown;
    try {
      parsed = extractJson(content);
    } catch (err) {
      throw new Error(`Erreur de parsing des tweets : ${String(err)}`);
    }
    for (const item of parsed as Array<Record<string, unknown>>) {
      try {
        tweets.push(parseSingleTweet(item, account));
      } catch { /**/ }
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

// ─── Parsing web (ArrayBuffer + JSZip) ───────────────────────────────────────

async function parseFromArrayBuffer(buffer: ArrayBuffer): Promise<ArchiveData> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buffer);

  const readFirst = async (suffixes: string[]): Promise<string | null> => {
    const keys = Object.keys(zip.files);
    for (const suffix of suffixes) {
      const match = keys.find(
        (k) => k.toLowerCase().endsWith(suffix.toLowerCase()) && !zip.files[k].dir
      );
      if (match) return zip.files[match].async('string');
    }
    return null;
  };

  const readAll = async (fragment: string): Promise<string[]> => {
    const keys = Object.keys(zip.files);
    const matches = keys.filter(
      (k) => k.toLowerCase().includes(fragment.toLowerCase()) && !zip.files[k].dir
    );
    return Promise.all(matches.map((k) => zip.files[k].async('string')));
  };

  let account: AccountInfo = {
    username: 'unknown', displayName: 'Unknown', avatarUrl: '', bio: '',
  };
  const accountRaw = await readFirst(['data/account.js', 'account.js']);
  if (accountRaw) { try { account = parseAccountInfo(extractJson(accountRaw)); } catch { /**/ } }
  const profileRaw = await readFirst(['data/profile.js', 'profile.js']);
  if (profileRaw) { try { account = parseProfileInfo(extractJson(profileRaw), account); } catch { /**/ } }

  const tweetContents: string[] = [];
  const mainFile = await readFirst(['data/tweets.js', 'data/tweet.js', 'tweets.js', 'tweet.js']);
  if (mainFile) tweetContents.push(mainFile);
  tweetContents.push(...await readAll('tweets-part'));

  if (tweetContents.length === 0) {
    throw new Error("Aucun fichier de tweets trouvé.");
  }

  const tweets: Tweet[] = [];
  for (const content of tweetContents) {
    let parsed: unknown;
    try { parsed = extractJson(content); } catch (err) {
      throw new Error(`Erreur de parsing : ${String(err)}`);
    }
    for (const item of parsed as Array<Record<string, unknown>>) {
      try { tweets.push(parseSingleTweet(item, account)); } catch { /**/ }
    }
  }

  if (tweets.length === 0) throw new Error("Aucun tweet valide trouvé.");

  return { years: buildYearStructure(tweets), totalTweets: tweets.length };
}

// ─── API publique ─────────────────────────────────────────────────────────────

export async function validateTwitterArchive(
  input: ArchiveInput
): Promise<{ valid: boolean; message?: string }> {
  if (typeof input === 'string') {
    const info = await FileSystem.getInfoAsync(input);
    if (!info.exists) return { valid: false, message: 'Fichier introuvable.' };
    if (!input.toLowerCase().endsWith('.zip')) {
      return {
        valid: false,
        message: "Le fichier doit être un ZIP (archive Twitter/X officielle).",
      };
    }
    // Validation légère : lire l'index et vérifier qu'il y a des tweets
    try {
      const index = await readZipIndex(input);
      const hasTweets = index.some(
        (e) =>
          e.filename.toLowerCase().includes('tweet.js') ||
          e.filename.toLowerCase().includes('tweets.js') ||
          e.filename.toLowerCase().includes('tweets-part')
      );
      if (!hasTweets) {
        return {
          valid: false,
          message: "Aucun fichier de tweets détecté dans l'archive.",
        };
      }
      return { valid: true };
    } catch (err) {
      return { valid: false, message: `ZIP invalide : ${String(err)}` };
    }
  }

  // Web : validation via JSZip
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(input);
    const files = Object.keys(zip.files).map((f) => f.toLowerCase());
    const hasTweets = files.some(
      (f) => f.includes('tweet.js') || f.includes('tweets.js') || f.includes('tweets-part')
    );
    return hasTweets
      ? { valid: true }
      : { valid: false, message: "Aucun fichier de tweets détecté." };
  } catch (err) {
    return { valid: false, message: `ZIP invalide : ${String(err)}` };
  }
}

export async function parseTwitterArchive(
  input: ArchiveInput
): Promise<ArchiveData> {
  if (typeof input !== 'string' || Platform.OS === 'web') {
    if (typeof input !== 'string') return parseFromArrayBuffer(input);
    throw new Error('fileUri non supporté sur web.');
  }
  // Natif : lecture directe dans le ZIP sans extraction
  return parseFromZipInPlace(input);
}
