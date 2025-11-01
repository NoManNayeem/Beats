// Media constants and configuration

// Supported audio formats
export const AUDIO_EXTENSIONS = [
  '.mp3',
  '.wav',
  '.m4a',
  '.aac',
  '.ogg',
  '.flac',
  '.wma',
  '.aiff',
] as const;

// Supported video formats
export const VIDEO_EXTENSIONS = [
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.m4v',
] as const;

// All supported media extensions
export const MEDIA_EXTENSIONS = [
  ...AUDIO_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
] as const;

// Common media directories to scan (platform-specific)
export const MEDIA_DIRECTORIES = {
  android: [
    '/storage/emulated/0/Music',
    '/storage/emulated/0/Download',
    '/storage/emulated/0/Movies',
    '/storage/emulated/0/DCIM',
  ],
  ios: [], // iOS requires different approach with MediaLibrary
};

export const isAudioFile = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return AUDIO_EXTENSIONS.includes(ext as any);
};

export const isVideoFile = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return VIDEO_EXTENSIONS.includes(ext as any);
};

export const isMediaFile = (filename: string): boolean => {
  return isAudioFile(filename) || isVideoFile(filename);
};

export const getMediaType = (filename: string): 'audio' | 'video' | null => {
  if (isAudioFile(filename)) return 'audio';
  if (isVideoFile(filename)) return 'video';
  return null;
};

