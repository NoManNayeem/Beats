// Player state type definitions

export interface PlayerState {
  currentTrack: string | null; // Media file path
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: 'none' | 'one' | 'all';
  shuffle: boolean;
  queue: string[]; // Array of media paths
  currentIndex: number;
}

export interface PlaybackControls {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (volume: number) => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
}

