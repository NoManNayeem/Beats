// Seek Bar Component - Custom seek bar for audio/video
// Based on React Native best practices (2025)

import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors, Spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SEEK_BAR_WIDTH = SCREEN_WIDTH - 32; // Account for padding

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (position: number) => void;
}

export const SeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const { colors } = useTheme();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const progress = duration > 0 ? currentTime / duration : 0;
  const displayProgress = isSeeking ? seekPosition / duration : progress;

  const trackRef = useRef<View>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      setIsSeeking(true);
      const { locationX } = event.nativeEvent;
      const newPosition = (locationX / SEEK_BAR_WIDTH) * duration;
      const clamped = Math.max(0, Math.min(newPosition, duration));
      setSeekPosition(clamped);
    },
    onPanResponderMove: (event: GestureResponderEvent) => {
      const { locationX } = event.nativeEvent;
      const newPosition = (locationX / SEEK_BAR_WIDTH) * duration;
      const clamped = Math.max(0, Math.min(newPosition, duration));
      setSeekPosition(clamped);
    },
    onPanResponderRelease: () => {
      setIsSeeking(false);
      onSeek(seekPosition);
    },
  });

  return (
    <View style={styles.container}>
      <View
        ref={trackRef}
        style={[styles.track, { backgroundColor: colors.border }]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.progress,
            {
              width: `${displayProgress * 100}%`,
              backgroundColor: Colors.primary,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: `${displayProgress * 100}%`,
              backgroundColor: Colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: Spacing.md,
  },
  track: {
    height: 4,
    borderRadius: 2,
    width: SEEK_BAR_WIDTH,
    position: 'relative',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    top: -6,
    marginLeft: -8,
  },
});

