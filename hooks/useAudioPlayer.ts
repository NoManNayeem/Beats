// Audio Player Hook - Wrapper for expo-audio
// Based on Expo SDK 54 (2025) official documentation

import { useAudioService } from '@/services/AudioService';
import { usePlayer } from '@/context/PlayerContext';
import { MediaFile } from '@/types/media';
import { useEffect, useRef } from 'react';

/**
 * Hook to manage audio playback with player context integration
 */
export const useAudioPlayer = () => {
  const playerContext = usePlayer();
  const {
    currentMedia,
    isPlaying: contextIsPlaying,
    currentTime: contextCurrentTime,
    duration: contextDuration,
    play: contextPlay,
    pause: contextPause,
    stop: contextStop,
    seek: contextSeek,
    volume,
    setVolume: contextSetVolume,
  } = playerContext;

  // Get audio source from current media
  const audioSource = currentMedia
    ? { uri: currentMedia.path }
    : null;

  // Initialize audio service with update callbacks
  const audioService = useAudioService(audioSource, {
    onTimeUpdate: (time: number) => {
      // Update context time (throttled via interval in audio service)
      if (playerContext._updateTime && Math.abs(time - contextCurrentTime) > 0.1) {
        playerContext._updateTime(time);
      }
    },
    onDurationUpdate: (dur: number) => {
      // Update context duration
      if (playerContext._updateDuration && Math.abs(dur - contextDuration) > 0.1) {
        playerContext._updateDuration(dur);
      }
    },
    autoPlay: false,
  });

  // Sync player state with context
  useEffect(() => {
    if (contextIsPlaying && !audioService.isPlaying && currentMedia) {
      audioService.play();
    } else if (!contextIsPlaying && audioService.isPlaying) {
      audioService.pause();
    }
  }, [contextIsPlaying, audioService, currentMedia]);

  // Sync volume
  useEffect(() => {
    if (Math.abs(audioService.volume - volume) > 0.01) {
      audioService.setVolume(volume);
    }
  }, [volume, audioService]);

  // Time updates are handled by audioService's interval
  // No need for separate sync here

  // Play media
  const play = async (media: MediaFile) => {
    await contextPlay(media);
    // Audio service will auto-play when source changes
    setTimeout(() => {
      audioService.play();
    }, 100);
  };

  // Pause playback
  const pause = () => {
    contextPause();
    audioService.pause();
  };

  // Stop playback
  const stop = () => {
    contextStop();
    audioService.stop();
  };

  // Seek to position
  const seek = async (position: number) => {
    await contextSeek(position);
    await audioService.seek(position);
  };

  // Use audio service time/duration for display
  const displayTime = audioService.currentTime || contextCurrentTime;
  const displayDuration = audioService.duration || contextDuration;

  return {
    currentMedia,
    isPlaying: contextIsPlaying || audioService.isPlaying,
    currentTime: displayTime,
    duration: displayDuration,
    volume,
    play,
    pause,
    stop,
    seek,
    setVolume: contextSetVolume,
    next: playerContext.next,
    previous: playerContext.previous,
    repeatMode: playerContext.repeatMode,
    shuffle: playerContext.shuffle,
    setRepeatMode: playerContext.setRepeatMode,
    toggleShuffle: playerContext.toggleShuffle,
  };
};

