// Playlist Detail Screen - View and manage playlist items
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { MediaFile } from '@/types/media';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { MediaItem } from '@/components/media/MediaItem';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getPlaylistItems,
  getPlaylists,
  removeFromPlaylist,
} from '@/services/StorageService';
import { scanDeviceStorage } from '@/services/MediaScanner';
import { usePlayer } from '@/context/PlayerContext';

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { setQueue, play } = usePlayer();
  const [playlist, setPlaylist] = useState<any>(null);
  const [playlistItems, setPlaylistItems] = useState<MediaFile[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPlaylist = useCallback(async () => {
    if (!id) return;

    try {
      // Get playlist info
      const playlists = await getPlaylists();
      const foundPlaylist = playlists.find((p) => p.id === id);
      setPlaylist(foundPlaylist);

      // Get playlist items
      const items = await getPlaylistItems(id);
      
      // Get all media files
      const { files } = await scanDeviceStorage();
      
      // Match playlist items with media files
      const mediaFiles = items
        .map((item) => files.find((f) => f.path === item.mediaPath))
        .filter((f): f is MediaFile => f !== undefined)
        .sort((a, b) => {
          const aIndex = items.findIndex((i) => i.mediaPath === a.path);
          const bIndex = items.findIndex((i) => i.mediaPath === b.path);
          return aIndex - bIndex;
        });

      setPlaylistItems(mediaFiles);
    } catch (error) {
      console.error('Failed to load playlist:', error);
    }
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPlaylist();
    setIsRefreshing(false);
  }, [loadPlaylist]);

  const handlePlayAll = async () => {
    if (playlistItems.length === 0) return;
    const audioFiles = playlistItems.filter((f) => f.type === 'audio');
    if (audioFiles.length > 0) {
      setQueue(audioFiles, 0);
      await play(audioFiles[0]);
        router.push({ pathname: '/player/audio' as any });
    }
  };

  const handleMediaPress = async (media: MediaFile) => {
    if (media.type === 'audio') {
      const audioFiles = playlistItems.filter((f) => f.type === 'audio');
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

  const handleRemove = async (media: MediaFile) => {
    // Find playlist item ID
    const items = await getPlaylistItems(id!);
    const item = items.find((i) => i.mediaPath === media.path);
    if (item) {
      await removeFromPlaylist(item.id);
      await loadPlaylist();
    }
  };

  if (!playlist) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <EmptyState
          title="Playlist not found"
          message="This playlist doesn't exist"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.playlistName, { color: colors.text }]}>
            {playlist.name}
          </Text>
          <Text style={[styles.trackCount, { color: colors.textSecondary }]}>
            {playlistItems.length} track{playlistItems.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {playlistItems.length > 0 && (
          <TouchableOpacity
            onPress={handlePlayAll}
            style={[styles.playButton, { backgroundColor: Colors.primary }]}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={playlistItems}
        renderItem={({ item }) => (
          <MediaItem
            media={item}
            onPress={() => handleMediaPress(item)}
            onLongPress={() => handleRemove(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            title="Playlist is empty"
            message="Add tracks to this playlist"
            icon={<Ionicons name="musical-notes" size={48} color={colors.textSecondary} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
  },
  playlistName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  trackCount: {
    ...Typography.bodySmall,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});

