-- Beats Database Schema
-- SQLite database for offline-first media player

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Playlist items table
CREATE TABLE IF NOT EXISTS playlist_items (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  media_path TEXT NOT NULL,
  position INTEGER NOT NULL,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  media_path TEXT UNIQUE NOT NULL,
  added_at INTEGER NOT NULL
);

-- Recently played table
CREATE TABLE IF NOT EXISTS recently_played (
  id TEXT PRIMARY KEY,
  media_path TEXT NOT NULL,
  played_at INTEGER NOT NULL
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_position ON playlist_items(position);
CREATE INDEX IF NOT EXISTS idx_recently_played_played_at ON recently_played(played_at DESC);

