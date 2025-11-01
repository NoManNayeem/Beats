// Audio Service Hook - Audio playback using expo-audio (SDK 54)
// Based on official Expo SDK 54 (2025) documentation
// Note: expo-audio uses hooks, so this must be used within a React component

import { useEffect, useRef } from 'react';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import * as Haptics from 'expo-haptics';

/**
 * Hook to manage audio playback
 * Must be used within a React component
 */
export const useAudioService = (
  source: AudioSource | null,
  options?: {
    onTimeUpdate?: (time: number) => void;
    onDurationUpdate?: (duration: number) => void;
    autoPlay?: boolean;
  }
) => {
  const player = useAudioPlayer(source || { uri: '' });

  const timeUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play if requested
  useEffect(() => {
    if (options?.autoPlay && player && !player.playing) {
      player.play();
    }
  }, [options?.autoPlay, player]);

  // Listen to time updates
  useEffect(() => {
    if (!player || !options?.onTimeUpdate) return;

    timeUpdateIntervalRef.current = setInterval(() => {
      if (player.playing && player.currentTime !== undefined && options?.onTimeUpdate) {
        options.onTimeUpdate(player.currentTime);
      }
    }, 100);

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [player, options?.onTimeUpdate]);

  // Listen to duration updates
  useEffect(() => {
    if (!player?.duration || !options?.onDurationUpdate) return;
    
    options.onDurationUpdate(player.duration);
  }, [player?.duration, options?.onDurationUpdate]);

  // Play function
  const play = async () => {
    try {
      await player.play();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  };

  // Pause function
  const pause = async () => {
    try {
      await player.pause();
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  };

  // Stop function
  const stop = async () => {
    try {
      await player.pause();
      await player.seekTo(0);
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  };

  // Seek function
  const seek = async (position: number) => {
    try {
      await player.seekTo(position);
      if (options?.onTimeUpdate) {
        options.onTimeUpdate(position);
      }
    } catch (error) {
      console.error('Failed to seek audio:', error);
    }
  };

  // Set volume
  const setVolume = (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    player.volume = clamped;
  };

  return {
    player,
    play,
    pause,
    stop,
    seek,
    setVolume,
    currentTime: player.currentTime || 0,
    duration: player.duration || 0,
    isPlaying: player.playing || false,
    volume: player.volume || 1.0,
  };
};

