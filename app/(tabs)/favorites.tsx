// Favorites Screen - View and manage favorites
// Based on Expo SDK 54 (2025) best practices

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { MediaFile } from '@/types/media';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { MediaItem } from '@/components/media/MediaItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { getFavorites, removeFavorite } from '@/services/StorageService';
import { scanDeviceStorage } from '@/services/MediaScanner';
import { usePlayer } from '@/context/PlayerContext';

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setQueue, play } = usePlayer();
  const [favoritePaths, setFavoritePaths] = useState<string[]>([]);
  const [favoriteMedia, setFavoriteMedia] = useState<MediaFile[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await getFavorites();
      const paths = favorites.map((f) => f.mediaPath);
      setFavoritePaths(paths);

      // Get media files for favorite paths
      const { files } = await scanDeviceStorage();
      const favoriteFiles = files.filter((f) => paths.includes(f.path));
      setFavoriteMedia(favoriteFiles);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFavorites();
    setIsRefreshing(false);
  }, [loadFavorites]);

  const handleMediaPress = async (media: MediaFile) => {
    if (media.type === 'audio') {
      const audioFiles = favoriteMedia.filter((f) => f.type === 'audio');
      const startIndex = audioFiles.findIndex((f) => f.id === media.id);
      setQueue(audioFiles, Math.max(0, startIndex));
      await play(media);
        router.push({ pathname: '/player/audio' as any });
    } else {
      router.push({
        pathname: '/player/video' as any,
        params: { path: encodeURIComponent(media.path) },
      });
    }
  };

  const handleRemoveFavorite = async (media: MediaFile) => {
    try {
      await removeFavorite(media.path);
      await loadFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {favoriteMedia.length} item{favoriteMedia.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={favoriteMedia}
        renderItem={({ item }) => (
          <MediaItem
            media={item}
            onPress={() => handleMediaPress(item)}
            onLongPress={() => handleRemoveFavorite(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            title="No favorites yet"
            message="Long press on any media file to add it to favorites"
            icon={<Ionicons name="heart-outline" size={48} color={colors.textSecondary} />}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.h1,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});

