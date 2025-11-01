// Mini Player Component - Collapsible bottom player bar
// Based on Expo SDK 54 (2025) best practices

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { formatDuration } from '@/utils/media';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MiniPlayer: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer();

  const { currentMedia, isPlaying, currentTime, duration, play, pause } = player;

  // Don't show if no media
  if (!currentMedia) {
    return null;
  }

  const handlePress = () => {
    router.push({ pathname: '/player/audio' as any });
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play(currentMedia);
    }
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: Colors.primary,
            },
          ]}
        />
      </View>

      {/* Player content */}
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons name="musical-notes" size={24} color={Colors.primary} />
        </View>

        {/* Track info */}
        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackName, { color: colors.text }]}
            numberOfLines={1}
          >
            {currentMedia.name.replace(/\.[^/.]+$/, '')}
          </Text>
          <Text style={[styles.trackMeta, { color: colors.textSecondary }]}>
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playButton}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => player.next()}
            style={styles.controlButton}
          >
            <Ionicons name="play-skip-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  trackMeta: {
    ...Typography.bodySmall,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playButton: {
    padding: Spacing.xs,
  },
  controlButton: {
    padding: Spacing.xs,
  },
});

