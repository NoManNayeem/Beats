// Audio Player Screen - Full audio playback interface
// Based on Expo SDK 54 (2025) best practices

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { usePlayer } from '@/context/PlayerContext';
import { useAudioService } from '@/services/AudioService';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { formatDuration } from '@/utils/media';
import { SeekBar } from '@/components/player/SeekBar';
import { scanDeviceStorage } from '@/services/MediaScanner';

export default function AudioPlayerScreen() {
  const router = useRouter();
  const { path } = useLocalSearchParams<{ path: string }>();
  const { colors } = useTheme();
  const player = usePlayer();

  // Initialize audio service
  const audioSource = player.currentMedia ? { uri: player.currentMedia.path } : null;
  const audioService = useAudioService(audioSource, {
    onTimeUpdate: (time: number) => {
      // Update handled via player context
    },
    onDurationUpdate: (dur: number) => {
      // Update handled via player context
    },
    autoPlay: player.isPlaying,
  });

  // Sync playback state
  useEffect(() => {
    if (player.isPlaying && !audioService.isPlaying && player.currentMedia) {
      audioService.play();
    } else if (!player.isPlaying && audioService.isPlaying) {
      audioService.pause();
    }
  }, [player.isPlaying, player.currentMedia, audioService]);

  const {
    currentMedia,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    shuffle,
  } = player;

  if (!currentMedia) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No audio playing
          </Text>
        </View>
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (isPlaying) {
      player.pause();
      audioService.pause();
    } else {
      if (currentMedia) {
        await player.play(currentMedia);
        audioService.play();
      }
    }
  };

  const handleSeek = async (position: number) => {
    await player.seek(position);
    await audioService.seek(position);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-down" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Now Playing</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Album Art / Icon */}
      <View style={styles.albumContainer}>
        <View style={[styles.albumArt, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons name="musical-notes" size={80} color={Colors.primary} />
        </View>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>
          {currentMedia.name.replace(/\.[^/.]+$/, '')}
        </Text>
        <Text style={[styles.trackMeta, { color: colors.textSecondary }]}>
          {currentMedia.folderPath}
        </Text>
      </View>

      {/* Seek Bar */}
      <View style={styles.seekContainer}>
        <SeekBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatDuration(currentTime)}
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Shuffle */}
        <TouchableOpacity
          onPress={player.toggleShuffle}
          style={styles.controlButton}
        >
          <Ionicons
            name={shuffle ? 'shuffle' : 'shuffle-outline'}
            size={24}
            color={shuffle ? Colors.primary : colors.text}
          />
        </TouchableOpacity>

        {/* Previous */}
        <TouchableOpacity onPress={player.previous} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          onPress={handlePlayPause}
          style={[styles.playButton, { backgroundColor: Colors.primary }]}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity onPress={player.next} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>

        {/* Repeat */}
        <TouchableOpacity
          onPress={() => {
            const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
            const currentIndex = modes.indexOf(repeatMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            player.setRepeatMode(nextMode);
          }}
          style={styles.controlButton}
        >
          <Ionicons
            name={
              repeatMode === 'one'
                ? 'repeat'
                : repeatMode === 'all'
                ? 'repeat'
                : 'repeat-outline'
            }
            size={24}
            color={
              repeatMode !== 'none' ? Colors.primary : colors.text
            }
          />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    fontWeight: '600',
  },
  albumContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  albumArt: {
    width: 280,
    height: 280,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  trackTitle: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  trackMeta: {
    ...Typography.body,
    textAlign: 'center',
  },
  seekContainer: {
    marginBottom: Spacing.xl,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  timeText: {
    ...Typography.bodySmall,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
  },
});

