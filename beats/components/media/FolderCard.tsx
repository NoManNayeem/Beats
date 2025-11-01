// Folder Card Component - Display folder with media count
// Based on React Native best practices (2025)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Folder } from '@/types/media';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';

interface FolderCardProps {
  folder: Folder;
  onPress?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onPress }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/folder/[path]',
        params: { path: encodeURIComponent(folder.path) },
      });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors.primary + '20' },
            ]}
          >
            <Ionicons
              name="folder"
              size={32}
              color={Colors.primary}
            />
          </View>
          <View style={styles.info}>
            <Text
              style={[styles.name, { color: colors.text }]}
              numberOfLines={1}
            >
              {folder.name}
            </Text>
            <Text
              style={[styles.count, { color: colors.textSecondary }]}
            >
              {folder.mediaCount} item{folder.mediaCount !== 1 ? 's' : ''}
              {folder.audioCount > 0 && folder.videoCount > 0 && (
                ` • ${folder.audioCount} audio, ${folder.videoCount} video`
              )}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
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
  count: {
    ...Typography.bodySmall,
  },
});
