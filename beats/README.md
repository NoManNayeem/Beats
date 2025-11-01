# 🎵 Beats - Offline-First Media Player

**Your media, always ready.**

Beats is a modern, offline-first media player app built with Expo SDK 54 (2025), React Native, and TypeScript. It automatically detects all audio and video files on your device, organizes them folder-wise, and provides full offline playback with background audio support.

## ✨ Features

### 🎧 Core Features
- **📁 Folder-Based Organization** - Automatically organizes media by folders with audio/video counts
- **🎵 Audio Player** - Full-featured audio playback with seek, shuffle, repeat modes, and background playback
- **🎬 Video Player** - Full-screen video playback with Picture-in-Picture (PiP) support
- **📱 Mini Player** - Always-visible mini player with quick controls
- **🔍 Global Search** - Search across all media files and folders
- **❤️ Favorites** - Quick access to your favorite media
- **📋 Playlists** - Create and manage custom playlists
- **🌓 Theme Support** - Light, dark, and auto theme modes
- **⚡ Offline-First** - Works completely offline, no internet required

### 🎨 User Experience
- Clean, minimal folder-based UI
- Smooth animations and transitions
- Quick actions (long press for options)
- Multi-select for bulk operations
- Recently played media
- Swipe gestures for navigation
- Customizable sorting options

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for emulator)
- Physical device with Expo Go app (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd beats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app (for physical devices)

### Development Build (Required for Media Library)

Since Beats uses native modules (`expo-media-library`, `expo-audio`, `expo-video`), you'll need to create a development build:

```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## 📱 Platform Requirements

### iOS
- iOS 13.0+
- Permissions: Media Library Access

### Android
- Android 8.0+ (API 26+)
- Permissions: READ_EXTERNAL_STORAGE, READ_MEDIA_AUDIO, READ_MEDIA_VIDEO

## 🏗️ Tech Stack

- **Framework:** Expo SDK 54 (2025)
- **React Native:** 0.81.5
- **Language:** TypeScript
- **Routing:** Expo Router (file-based routing)
- **State Management:** React Context API
- **Database:** SQLite (expo-sqlite)
- **Audio:** expo-audio
- **Video:** expo-video
- **Media Library:** expo-media-library
- **Storage:** AsyncStorage

## 📂 Project Structure

```
beats/
├── app/                  # Expo Router pages
│   ├── (tabs)/          # Tab navigation screens
│   ├── folder/          # Folder detail screen
│   ├── player/          # Audio/video player screens
│   └── playlist/        # Playlist detail screen
├── components/          # Reusable React components
│   ├── media/           # Media-related components
│   ├── player/          # Player-related components
│   ├── permissions/     # Permission handling
│   └── ui/              # UI components
├── context/             # React Context providers
│   ├── PlayerContext.tsx
│   └── ThemeContext.tsx
├── services/            # Business logic services
│   ├── AudioService.ts
│   ├── MediaScanner.ts
│   └── StorageService.ts
├── types/               # TypeScript type definitions
├── constants/           # App constants (theme, media types)
├── utils/               # Utility functions
└── database/            # Database schemas

```

## 🎯 Key Features Explained

### Offline-First Architecture
- All media detection happens locally
- SQLite database for playlists, favorites, and recently played
- No network calls required for core functionality

### Media Detection
- Automatically scans device storage for audio/video files
- Organizes by folder/album structure
- Supports common formats (MP3, MP4, M4A, WAV, MKV, AVI, etc.)

### Background Playback
- Audio continues playing when app is in background
- Media controls in notification center
- Proper audio session management

## 🔧 Configuration

### App Configuration (`app.json`)
- iOS background modes enabled for audio
- Android permissions configured
- Media library plugin configured with granular permissions

### Environment Variables
No environment variables required for basic functionality.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Expo SDK 54 (2025)**
