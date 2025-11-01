// Media Item Component - Display audio/video file in list
// Based on React Native best practices (2025)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { MediaFile } from '@/types/media';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { formatDuration, formatFileSize } from '@/utils/media';
import { Card } from '@/components/ui/Card';
import { FavoriteButton } from './FavoriteButton';

interface MediaItemProps {
  media: MediaFile;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  showDuration?: boolean;
}

export const MediaItem: React.FC<MediaItemProps> = ({
  media,
  onPress,
  onLongPress,
  isSelected = false,
  showDuration = true,
}) => {
  const { colors } = useTheme();

  const iconName =
    media.type === 'audio'
      ? 'musical-notes'
      : media.type === 'video'
      ? 'videocam'
      : 'document';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Card
        style={StyleSheet.flatten([
          styles.card,
          isSelected && { borderWidth: 2, borderColor: Colors.primary },
        ])}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  media.type === 'audio'
                    ? Colors.primary + '20'
                    : Colors.accent + '20',
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={media.type === 'audio' ? Colors.primary : Colors.accent}
            />
          </View>
          <View style={styles.info}>
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {media.name.replace(/\.[^/.]+$/, '')}
            </Text>
            <View style={styles.meta}>
              <Text
                style={[styles.metaText, { color: colors.textSecondary }]}
              >
                {media.type.toUpperCase()}
              </Text>
              {showDuration && media.duration && (
                <>
                  <Text style={[styles.metaDot, { color: colors.textSecondary }]}>•</Text>
                  <Text
                    style={[styles.metaText, { color: colors.textSecondary }]}
                  >
                    {formatDuration(media.duration)}
                  </Text>
                </>
              )}
              <Text style={[styles.metaDot, { color: colors.textSecondary }]}>•</Text>
              <Text
                style={[styles.metaText, { color: colors.textSecondary }]}
              >
                {formatFileSize(media.size)}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <FavoriteButton media={media} size={20} />
            <TouchableOpacity>
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.bodySmall,
  },
  metaDot: {
    fontSize: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
