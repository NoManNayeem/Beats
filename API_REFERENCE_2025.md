# API Reference - Expo SDK 54 (2025)
## Verified APIs for Beats Media Player

Based on official Expo SDK 54 documentation, here are the exact APIs we're using:

---

## ✅ Installed Packages (Verified)

- `expo-audio@1.0.14` - Modern audio playback
- `expo-video@3.0.12` - Video playback with PiP support
- `expo-file-system@19.0.17` - File system operations
- `expo-sqlite@16.0.8` - SQLite database
- `@react-native-async-storage/async-storage` - Key-value storage

---

## 📚 API Usage Patterns (SDK 54)

### 1. expo-audio

**Primary Hook: `useAudioPlayer`**

```typescript
import { useAudioPlayer } from 'expo-audio';

const player = useAudioPlayer(source);
// player.currentTime
// player.duration
// player.isPlaying
// player.isLoaded
// player.play()
// player.pause()
// player.seekTo(position)
// player.replay()
```

**Background Audio Configuration:**
- Configure in `app.json` with `UIBackgroundModes: ["audio"]`
- Use `Audio.setAudioModeAsync()` for audio session configuration

### 2. expo-video

**Component: `VideoView`**

```typescript
import { VideoView, useVideoPlayer } from 'expo-video';

const player = useVideoPlayer(source);
// player.play()
// player.pause()
// player.currentTime
// player.duration
// player.isPlaying
// player.isMuted
// player.volume
// player.seekTo(time)

<VideoView
  player={player}
  allowsFullscreen
  allowsPictureInPicture
  contentFit="contain"
/>
```

### 3. expo-file-system

**Note:** SDK 54 introduced a new File/Directory API. For now, we use the legacy API which is accessible via `expo-file-system/legacy`. Migration to the new API is planned.

**Directory Scanning (Legacy API):**

```typescript
import * as FileSystem from 'expo-file-system/legacy';

// Read directory
const files = await FileSystem.readDirectoryAsync(path);

// Get file info
const info = await FileSystem.getInfoAsync(path);

// Check if directory exists
if (info.exists && info.isDirectory) {
  // Process directory
}
```

**Media Detection:**
- Scan common media directories
- Filter by file extensions (.mp3, .mp4, .wav, etc.)
- Read metadata with `getInfoAsync`

**Future Migration:**
- New API uses File and Directory classes
- Better TypeScript support
- Enhanced Android SAF (Storage Access Framework) support

### 4. expo-sqlite

**Database Operations:**

```typescript
import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('beats.db');

// Execute queries
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

// Run queries
const result = await db.getAllAsync('SELECT * FROM playlists');
await db.runAsync('INSERT INTO playlists (id, name, created_at) VALUES (?, ?, ?)', [
  id, name, Date.now()
]);
```

### 5. @react-native-async-storage/async-storage

**Simple Storage:**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store
await AsyncStorage.setItem('theme', 'dark');

// Retrieve
const theme = await AsyncStorage.getItem('theme');

// Remove
await AsyncStorage.removeItem('theme');
```

---

## 🎯 Implementation Strategy

Based on 2025 best practices:

1. **Use hooks-based APIs** (`useAudioPlayer`, `useVideoPlayer`)
2. **Async/await pattern** for all file operations
3. **TypeScript** for type safety
4. **React Context** for global state management
5. **Expo Router** file-based routing (already configured)

---

## ⚠️ Important Notes

- `expo-audio` is the recommended audio library (not expo-av for audio-only)
- `expo-video` is separate and handles video playback
- Both support background playback when configured in `app.json`
- File system access requires proper permissions in `app.json`

---

**Last Updated:** January 2025
**SDK Version:** 54.0.21

