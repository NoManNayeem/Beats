// Home Screen - Library Overview
// Folder-based grid/list view with search, recently played, and offline indicators

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Folder, MediaFile } from '@/types/media';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { FolderCard } from '@/components/media/FolderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PermissionScreen } from '@/components/permissions/PermissionScreen';
import { scanDeviceStorage, checkMediaPermissions } from '@/services/MediaScanner';
import { getRecentlyPlayed } from '@/services/StorageService';

type ViewMode = 'grid' | 'list';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isScanning, setIsScanning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const granted = await checkMediaPermissions();
    setHasPermissions(granted);
  };

  const handlePermissionsGranted = () => {
    setHasPermissions(true);
    // Start loading media after permissions are granted
    loadMediaLibrary();
    loadRecentlyPlayed();
  };

  // Load media library
  const loadMediaLibrary = useCallback(async () => {
    try {
      setIsScanning(true);
      const { folders } = await scanDeviceStorage();
      setFolders(folders);
    } catch (error) {
      console.error('Failed to scan media:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Load recently played
  const loadRecentlyPlayed = useCallback(async () => {
    try {
      const recent = await getRecentlyPlayed(10);
      setRecentlyPlayed(recent.map((r) => r.mediaPath));
    } catch (error) {
      console.error('Failed to load recently played:', error);
    }
  }, []);

  // Load media when permissions are granted
  useEffect(() => {
    if (hasPermissions === true) {
      loadMediaLibrary();
      loadRecentlyPlayed();
    }
  }, [hasPermissions]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadMediaLibrary(), loadRecentlyPlayed()]);
    setIsRefreshing(false);
  }, [loadMediaLibrary, loadRecentlyPlayed]);

  // Filter folders based on search
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Beats</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your media, always ready
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleViewMode}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

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
          placeholder="Search folders..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Offline Indicator */}
      <View style={[styles.offlineIndicator, { backgroundColor: Colors.primary + '20' }]}>
        <Ionicons name="cloud-done" size={16} color={Colors.primary} />
        <Text style={[styles.offlineText, { color: Colors.primary }]}>
          All media available offline
        </Text>
      </View>

      {/* Recently Played Section */}
      {recentlyPlayed.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recently Played
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyPlayed.slice(0, 5).map((path, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.recentItem,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                  // Navigate to player or folder
                }}
              >
                <Ionicons
                  name="play-circle"
                  size={24}
                  color={Colors.primary}
                />
                <Text
                  style={[styles.recentItemText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {path.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unknown'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Folders Section */}
      <View style={styles.foldersSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Folders ({filteredFolders.length})
          </Text>
          <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
            <Ionicons
              name="refresh"
              size={20}
              color={Colors.primary}
              style={[
                styles.refreshIcon,
                isRefreshing && styles.refreshIconSpinning,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFolder = ({ item }: { item: Folder }) => (
    <FolderCard folder={item} />
  );

  // Show permission screen if permissions not granted
  if (hasPermissions === false) {
    return <PermissionScreen onPermissionsGranted={handlePermissionsGranted} />;
  }

  // Show loading state while checking permissions
  if (hasPermissions === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (isScanning && folders.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Scanning for media files...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredFolders}
        renderItem={renderFolder}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No folders found"
            message={
              searchQuery
                ? 'Try adjusting your search'
                : 'Pull down to scan for media files'
            }
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
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  offlineText: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  recentSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  recentItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    gap: Spacing.sm,
  },
  recentItemText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  foldersSection: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  refreshIcon: {
    transform: [{ rotate: '0deg' }],
  },
  refreshIconSpinning: {
    transform: [{ rotate: '360deg' }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
  },
});

