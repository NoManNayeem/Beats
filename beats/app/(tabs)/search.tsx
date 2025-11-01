// Search Screen - Global media search
// Based on Expo SDK 54 (2025) best practices

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { MediaFile, Folder } from '@/types/media';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { MediaItem } from '@/components/media/MediaItem';
import { FolderCard } from '@/components/media/FolderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { scanDeviceStorage } from '@/services/MediaScanner';
import { usePlayer } from '@/context/PlayerContext';

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setQueue, play } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [allMedia, setAllMedia] = useState<MediaFile[]>([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]);

  // Load all media on mount
  React.useEffect(() => {
    const loadMedia = async () => {
      try {
        const { files, folders } = await scanDeviceStorage();
        setAllMedia(files);
        setAllFolders(folders);
      } catch (error) {
        console.error('Failed to load media for search:', error);
      }
    };
    loadMedia();
  }, []);

  // Filter results
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { media: [], folders: [] };
    }

    const query = searchQuery.toLowerCase();
    const media = allMedia.filter(
      (file) =>
        file.name.toLowerCase().includes(query) ||
        file.folderPath.toLowerCase().includes(query)
    );
    const folders = allFolders.filter(
      (folder) => folder.name.toLowerCase().includes(query)
    );

    return { media, folders };
  }, [searchQuery, allMedia, allFolders]);

  const handleMediaPress = async (media: MediaFile) => {
    if (media.type === 'audio') {
      const audioFiles = filteredResults.media.filter((f) => f.type === 'audio');
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

  const renderItem = ({ item }: { item: MediaFile | Folder; index: number }) => {
    if ('type' in item) {
      // MediaFile
      return <MediaItem media={item} onPress={() => handleMediaPress(item)} />;
    } else {
      // Folder
      return <FolderCard folder={item} />;
    }
  };

  const combinedResults = [
    ...filteredResults.folders,
    ...filteredResults.media,
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search media and folders..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      {searchQuery.trim() && (
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            {combinedResults.length} result{combinedResults.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={combinedResults}
        renderItem={renderItem}
        keyExtractor={(item, index) => ('id' in item ? item.id : `folder_${index}`)}
        ListEmptyComponent={
          searchQuery.trim() ? (
            <EmptyState
              title="No results found"
              message="Try a different search term"
              icon={<Ionicons name="search-outline" size={48} color={colors.textSecondary} />}
            />
          ) : (
            <EmptyState
              title="Start searching"
              message="Type to search your media library"
              icon={<Ionicons name="search" size={48} color={colors.textSecondary} />}
            />
          )
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  resultsText: {
    ...Typography.bodySmall,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});

