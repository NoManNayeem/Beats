// Storage Service - SQLite and AsyncStorage wrapper
// Based on Expo SDK 54 (2025) APIs

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, PlaylistItem, Favorite, RecentlyPlayed } from '@/types/media';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize database (singleton pattern)
 */
export const initDatabase = async (): Promise<void> => {
  // Return existing promise if initialization is in progress
  if (initPromise) {
    return initPromise;
  }
  
  // Return immediately if already initialized
  if (db) {
    return;
  }
  
  initPromise = (async () => {
    try {
      db = await SQLite.openDatabaseAsync('beats.db');
      
      // Create schema
      await db.execAsync(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS playlist_items (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL,
        media_path TEXT NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        media_path TEXT UNIQUE NOT NULL,
        added_at INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS recently_played (
        id TEXT PRIMARY KEY,
        media_path TEXT NOT NULL,
        played_at INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_items_position ON playlist_items(position);
      CREATE INDEX IF NOT EXISTS idx_recently_played_played_at ON recently_played(played_at DESC);
    `);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      db = null;
      initPromise = null;
      throw error;
    }
  })();
  
  return initPromise;
};

/**
 * Ensure database is initialized
 */
const ensureInitialized = async (): Promise<void> => {
  if (!db) {
    await initDatabase();
  }
  if (!db) {
    throw new Error('Database failed to initialize');
  }
};

// Type assertion helper - db is guaranteed to be non-null after ensureInitialized
const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

/**
 * Playlists
 */
export const createPlaylist = async (name: string): Promise<Playlist> => {
  await ensureInitialized();
  const database = getDb();
  
  const id = `playlist_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const now = Date.now();
  
  await database.runAsync(
    'INSERT INTO playlists (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
    [id, name, now, now]
  );
  
  return { id, name, createdAt: now, updatedAt: now, mediaCount: 0 };
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  await ensureInitialized();
  const database = getDb();
  
  const playlists = await database.getAllAsync<Playlist>(
    'SELECT * FROM playlists ORDER BY updated_at DESC'
  );
  
  // Get media count for each playlist
  for (const playlist of playlists) {
    const count = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM playlist_items WHERE playlist_id = ?',
      [playlist.id]
    );
    playlist.mediaCount = count?.count || 0;
  }
  
  return playlists;
};

export const deletePlaylist = async (id: string): Promise<void> => {
  await ensureInitialized();
  const database = getDb();
  await database.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
};

/**
 * Playlist Items
 */
export const addToPlaylist = async (
  playlistId: string,
  mediaPath: string
): Promise<void> => {
  await ensureInitialized();
  const database = getDb();
  
  const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  
  // Get max position
  const maxPos = await database.getFirstAsync<{ max_position: number }>(
    'SELECT COALESCE(MAX(position), -1) + 1 as max_position FROM playlist_items WHERE playlist_id = ?',
    [playlistId]
  );
  
  const position = maxPos?.max_position || 0;
  
  await database.runAsync(
    'INSERT INTO playlist_items (id, playlist_id, media_path, position) VALUES (?, ?, ?, ?)',
    [id, playlistId, mediaPath, position]
  );
  
  // Update playlist updated_at
  await database.runAsync(
    'UPDATE playlists SET updated_at = ? WHERE id = ?',
    [Date.now(), playlistId]
  );
};

export const getPlaylistItems = async (playlistId: string): Promise<PlaylistItem[]> => {
  await ensureInitialized();
  const database = getDb();
  
  return await database.getAllAsync<PlaylistItem>(
    'SELECT * FROM playlist_items WHERE playlist_id = ? ORDER BY position ASC',
    [playlistId]
  );
};

export const removeFromPlaylist = async (itemId: string): Promise<void> => {
  await ensureInitialized();
  const database = getDb();
  await database.runAsync('DELETE FROM playlist_items WHERE id = ?', [itemId]);
};

/**
 * Favorites
 */
export const addFavorite = async (mediaPath: string): Promise<Favorite> => {
  await ensureInitialized();
  const database = getDb();
  
  const id = `fav_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const addedAt = Date.now();
  
  await database.runAsync(
    'INSERT OR REPLACE INTO favorites (id, media_path, added_at) VALUES (?, ?, ?)',
    [id, mediaPath, addedAt]
  );
  
  return { id, mediaPath, addedAt };
};

export const removeFavorite = async (mediaPath: string): Promise<void> => {
  await ensureInitialized();
  const database = getDb();
  await database.runAsync('DELETE FROM favorites WHERE media_path = ?', [mediaPath]);
};

export const getFavorites = async (): Promise<Favorite[]> => {
  await ensureInitialized();
  const database = getDb();
  return await database.getAllAsync<Favorite>(
    'SELECT * FROM favorites ORDER BY added_at DESC'
  );
};

export const isFavorite = async (mediaPath: string): Promise<boolean> => {
  await ensureInitialized();
  const database = getDb();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM favorites WHERE media_path = ?',
    [mediaPath]
  );
  return (result?.count || 0) > 0;
};

/**
 * Recently Played
 */
export const addRecentlyPlayed = async (mediaPath: string): Promise<void> => {
  await ensureInitialized();
  const database = getDb();
  
  const id = `recent_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const playedAt = Date.now();
  
  // Remove if already exists
  await database.runAsync(
    'DELETE FROM recently_played WHERE media_path = ?',
    [mediaPath]
  );
  
  // Insert new record
  await database.runAsync(
    'INSERT INTO recently_played (id, media_path, played_at) VALUES (?, ?, ?)',
    [id, mediaPath, playedAt]
  );
  
  // Keep only last 50
  await database.runAsync(`
    DELETE FROM recently_played 
    WHERE id NOT IN (
      SELECT id FROM recently_played 
      ORDER BY played_at DESC 
      LIMIT 50
    )
  `);
};

export const getRecentlyPlayed = async (limit: number = 10): Promise<RecentlyPlayed[]> => {
  await ensureInitialized();
  const database = getDb();
  return await database.getAllAsync<RecentlyPlayed>(
    'SELECT * FROM recently_played ORDER BY played_at DESC LIMIT ?',
    [limit]
  );
};

/**
 * App Settings (using AsyncStorage for simple key-value)
 */
export const getSetting = async (key: string): Promise<string | null> => {
  return await AsyncStorage.getItem(key);
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  return await AsyncStorage.setItem(key, value);
};

export const removeSetting = async (key: string): Promise<void> => {
  return await AsyncStorage.removeItem(key);
};

