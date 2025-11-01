// Video Player Screen - Full video playback with PiP support
// Based on Expo SDK 54 (2025) official documentation

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing, Typography } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { path } = useLocalSearchParams<{ path: string }>();
  const { colors } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoSource = path ? { uri: decodeURIComponent(path) } : null;
  const player = useVideoPlayer(videoSource || { uri: '' }, (player) => {
    player.loop = false;
    player.muted = false;
  });

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, player.playing]);

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
    setShowControls(true);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowControls(true);
  };

  if (!videoSource) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.errorText, { color: colors.text }]}>
          No video selected
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={isFullscreen ? styles.fullscreenVideo : styles.video}
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={false}
      />

      {/* Custom Controls Overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.controlButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {path?.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Video'}
            </Text>
            <TouchableOpacity
              onPress={handleFullscreen}
              style={styles.controlButton}
            >
              <Ionicons
                name={isFullscreen ? 'contract' : 'expand'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Center play button */}
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.centerButton}
          >
            <Ionicons
              name={player.playing ? 'pause' : 'play'}
              size={48}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Tap to show controls */}
      <TouchableOpacity
        style={styles.tapArea}
        onPress={() => setShowControls(!showControls)}
        activeOpacity={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 9) / 16, // 16:9 aspect ratio
  },
  fullscreenVideo: {
    width: SCREEN_HEIGHT,
    height: SCREEN_WIDTH,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlButton: {
    padding: Spacing.sm,
  },
  videoTitle: {
    ...Typography.body,
    color: '#FFFFFF',
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  centerButton: {
    alignSelf: 'center',
    padding: Spacing.md,
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    padding: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});

