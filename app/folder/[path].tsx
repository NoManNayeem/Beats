// Folder Screen - Display media files in selected folder
// Supports list/grid view, sorting, multi-select, and quick actions

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { MediaFile, SortOption, ViewMode } from '@/types/media';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { MediaItem } from '@/components/media/MediaItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { scanFolder, scanDeviceStorage } from '@/services/MediaScanner';
import { sortMediaFiles } from '@/utils/media';
import { usePlayer } from '@/context/PlayerContext';

export default function FolderScreen() {
  const router = useRouter();
  const { path } = useLocalSearchParams<{ path: string }>();
  const folderPath = path ? decodeURIComponent(path) : '';
  const { colors } = useTheme();
  const { setQueue, play } = usePlayer();

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Load media files in folder
  const loadFolderMedia = useCallback(async () => {
    try {
      // First try to scan just this folder
      const files = await scanFolder(folderPath);
      setMediaFiles(sortMediaFiles(files, sortBy));
    } catch (error) {
      console.error('Failed to load folder media:', error);
      // Fallback: rescan all and filter
      const { files } = await scanDeviceStorage();
      const folderFiles = files.filter((f) => f.folderPath === folderPath);
      setMediaFiles(sortMediaFiles(folderFiles, sortBy));
    }
  }, [folderPath, sortBy]);

  useEffect(() => {
    if (folderPath) {
      loadFolderMedia();
    }
  }, [folderPath, loadFolderMedia]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadFolderMedia();
    setIsRefreshing(false);
  }, [loadFolderMedia]);

  // Sort handler
  const handleSort = (option: SortOption) => {
    setSortBy(option);
    setShowSortMenu(false);
  };

  // Toggle selection
  const toggleSelection = (mediaId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(mediaId)) {
      newSelection.delete(mediaId);
    } else {
      newSelection.add(mediaId);
    }
    setSelectedItems(newSelection);
  };

  // Select all
  const selectAll = () => {
    if (selectedItems.size === mediaFiles.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(mediaFiles.map((m) => m.id)));
    }
  };

  // Handle media item press
  const handleMediaPress = async (media: MediaFile) => {
    if (selectedItems.size > 0) {
      toggleSelection(media.id);
    } else {
      if (media.type === 'audio') {
        // Set queue with all audio files from this folder
        const audioFiles = mediaFiles.filter(f => f.type === 'audio');
        const startIndex = audioFiles.findIndex(f => f.id === media.id);
        setQueue(audioFiles, Math.max(0, startIndex));
        await play(media);
        router.push({ pathname: '/player/audio' as any });
      } else {
        router.push({
          pathname: '/player/video' as any,
          params: { path: encodeURIComponent(media.path) },
        });
      }
    }
  };

  // Handle long press
  const handleMediaLongPress = (media: MediaFile) => {
    toggleSelection(media.id);
  };

  const folderName = folderPath.split('/').pop() || 'Folder';

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text
            style={[styles.folderName, { color: colors.text }]}
            numberOfLines={1}
          >
            {folderName}
          </Text>
          <Text
            style={[styles.fileCount, { color: colors.textSecondary }]}
          >
            {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {selectedItems.size > 0 ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={selectAll}
            >
              <Text style={[styles.actionText, { color: colors.text }]}>
                {selectedItems.size === mediaFiles.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.primary }]}
              onPress={() => {
                // TODO: Handle multi-select actions
                setSelectedItems(new Set());
              }}
            >
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
                Play ({selectedItems.size})
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Ionicons name="funnel" size={20} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {sortBy}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={[styles.sortMenu, { backgroundColor: colors.surface }]}>
          {(['name', 'date', 'size', 'duration'] as SortOption[]).map(
            (option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && {
                    backgroundColor: Colors.primary + '20',
                  },
                ]}
                onPress={() => handleSort(option)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: colors.text },
                    sortBy === option && { color: Colors.primary },
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
                {sortBy === option && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            )
          )}
        </View>
      )}
    </View>
  );

  const renderMediaItem = ({ item }: { item: MediaFile }) => (
    <MediaItem
      media={item}
      onPress={() => handleMediaPress(item)}
      onLongPress={() => handleMediaLongPress(item)}
      isSelected={selectedItems.has(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={mediaFiles}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No media files found"
            message="This folder doesn't contain any media files"
            icon={
              <Ionicons
                name="folder-open"
                size={48}
                color={colors.textSecondary}
              />
            }
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
  },
  folderName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  fileCount: {
    ...Typography.bodySmall,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  sortMenu: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginTop: Spacing.sm,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  sortOptionText: {
    ...Typography.body,
  },
});

