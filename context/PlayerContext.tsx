// Player Context - Global audio/video player state management
// Based on Expo SDK 54 (2025) best practices

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PlayerState } from '@/types/player';
import { MediaFile } from '@/types/media';
import { addRecentlyPlayed } from '@/services/StorageService';

interface PlayerContextType {
  // Current media
  currentMedia: MediaFile | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  
  // Queue management
  queue: MediaFile[];
  currentIndex: number;
  
  // Player controls
  play: (media: MediaFile) => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (position: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  
  // Queue management
  setQueue: (media: MediaFile[], startIndex?: number) => void;
  addToQueue: (media: MediaFile) => void;
  
  // Playback modes
  repeatMode: 'none' | 'one' | 'all';
  shuffle: boolean;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  
  // Volume
  volume: number;
  setVolume: (volume: number) => void;
  
  // Internal update functions (for player services)
  _updateTime?: (time: number) => void;
  _updateDuration?: (duration: number) => void;
  _registerUpdates?: (callbacks: { time?: (time: number) => void; duration?: (duration: number) => void }) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueueState] = useState<MediaFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatModeState] = useState<'none' | 'one' | 'all'>('none');
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolumeState] = useState(1.0);
  
  // Update functions exposed via context
  const [updateCallbacks, setUpdateCallbacks] = useState<{
    time?: (time: number) => void;
    duration?: (dur: number) => void;
  }>({});

  // Update time position (called by player services)
  const updateTime = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Update duration (called by player services)
  const updateDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  // Play media
  const play = useCallback(async (media: MediaFile) => {
    setCurrentMedia(media);
    setIsPlaying(true);
    setCurrentTime(0);
    
    // Track in recently played
    try {
      await addRecentlyPlayed(media.path);
    } catch (error) {
      console.warn('Failed to add to recently played:', error);
    }
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Stop playback
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentMedia(null);
  }, []);

  // Seek to position
  const seek = useCallback(async (position: number) => {
    setCurrentTime(Math.max(0, Math.min(position, duration)));
    // Actual seek is handled by player service
  }, [duration]);

  // Play next track
  const next = useCallback(async () => {
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        stop();
        return;
      }
    }
    
    setCurrentIndex(nextIndex);
    await play(queue[nextIndex]);
  }, [queue, currentIndex, repeatMode, play, stop]);

  // Play previous track
  const previous = useCallback(async () => {
    if (queue.length === 0) return;
    
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        prevIndex = 0;
      }
    }
    
    setCurrentIndex(prevIndex);
    await play(queue[prevIndex]);
  }, [queue, currentIndex, repeatMode, play]);

  // Set queue
  const setQueue = useCallback((media: MediaFile[], startIndex: number = 0) => {
    const shuffled = shuffle ? [...media].sort(() => Math.random() - 0.5) : media;
    setQueueState(shuffled);
    setCurrentIndex(startIndex);
  }, [shuffle]);

  // Add to queue
  const addToQueue = useCallback((media: MediaFile) => {
    setQueueState(prev => [...prev, media]);
  }, []);

  // Set repeat mode
  const setRepeatMode = useCallback((mode: 'none' | 'one' | 'all') => {
    setRepeatModeState(mode);
  }, []);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setShuffle(prev => {
      if (!prev && queue.length > 0) {
        // Shuffle current queue
        const shuffled = [...queue].sort(() => Math.random() - 0.5);
        setQueueState(shuffled);
        setCurrentIndex(0); // Reset to start of shuffled queue
      }
      return !prev;
    });
  }, [queue]);

  // Set volume
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
  }, []);

  // Handle track end
  useEffect(() => {
    if (
      isPlaying &&
      currentTime > 0 &&
      duration > 0 &&
      Math.abs(currentTime - duration) < 0.5 &&
      duration > 1 // Ensure we have a valid duration
    ) {
      // Track ended
      if (repeatMode === 'one') {
        // Repeat same track - reset time (audio service will restart)
        setCurrentTime(0);
      } else if (repeatMode === 'all' || queue.length > 1) {
        // Play next track
        next();
      } else {
        // Stop if no repeat and no queue
        stop();
      }
    }
  }, [isPlaying, currentTime, duration, repeatMode, queue.length, next, stop]);

  // Expose update functions
  const registerUpdates = useCallback((callbacks: {
    time?: (time: number) => void;
    duration?: (dur: number) => void;
  }) => {
    setUpdateCallbacks(callbacks);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentMedia,
        isPlaying,
        currentTime,
        duration,
        queue,
        currentIndex,
        play,
        pause,
        stop,
        seek,
        next,
        previous,
        setQueue,
        addToQueue,
        repeatMode,
        shuffle,
        setRepeatMode,
        toggleShuffle,
        volume,
        setVolume,
        // Internal update functions for player services
        _updateTime: updateTime,
        _updateDuration: updateDuration,
        _registerUpdates: registerUpdates,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

// Expose update functions for player services
export const usePlayerUpdates = () => {
  const context = useContext(PlayerContext);
  if (!context) return null;
  
  return {
    updateTime: (time: number) => {
      // This will be implemented by player services
    },
    updateDuration: (dur: number) => {
      // This will be implemented by player services
    },
  };
};

