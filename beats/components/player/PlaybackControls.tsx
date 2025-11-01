// Playback Controls Component - Reusable player controls
// Based on Expo SDK 54 (2025) best practices

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onShuffle?: () => void;
  onRepeat?: () => void;
  shuffle?: boolean;
  repeatMode?: 'none' | 'one' | 'all';
  showShuffle?: boolean;
  showRepeat?: boolean;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
  shuffle = false,
  repeatMode = 'none',
  showShuffle = true,
  showRepeat = true,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {showShuffle && onShuffle && (
        <TouchableOpacity onPress={onShuffle} style={styles.controlButton}>
          <Ionicons
            name={shuffle ? 'shuffle' : 'shuffle-outline'}
            size={24}
            color={shuffle ? Colors.primary : colors.text}
          />
        </TouchableOpacity>
      )}

      {onPrevious && (
        <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onPlayPause}
        style={[styles.playButton, { backgroundColor: Colors.primary }]}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={40}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {onNext && (
        <TouchableOpacity onPress={onNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>
      )}

      {showRepeat && onRepeat && (
        <TouchableOpacity onPress={onRepeat} style={styles.controlButton}>
          <Ionicons
            name={
              repeatMode === 'one'
                ? 'repeat'
                : repeatMode === 'all'
                ? 'repeat'
                : 'repeat-outline'
            }
            size={24}
            color={repeatMode !== 'none' ? Colors.primary : colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  controlButton: {
    padding: Spacing.sm,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

