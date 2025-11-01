// Playlists Screen - Manage playlists
// Based on Expo SDK 54 (2025) best practices

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Playlist } from '@/types/media';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
} from '@/services/StorageService';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const loadPlaylists = useCallback(async () => {
    try {
      const list = await getPlaylists();
      setPlaylists(list);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
      await loadPlaylists();
    } catch (error) {
      console.error('Failed to create playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist(playlist.id);
              await loadPlaylists();
            } catch (error) {
              console.error('Failed to delete playlist:', error);
              Alert.alert('Error', 'Failed to delete playlist');
            }
          },
        },
      ]
    );
  };

  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: '/playlist/[id]' as any,
          params: { id: item.id },
        });
      }}
    >
      <Card style={styles.playlistCard}>
        <View style={styles.playlistContent}>
          <View style={[styles.playlistIcon, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="musical-notes" size={32} color={Colors.primary} />
          </View>
          <View style={styles.playlistInfo}>
            <Text style={[styles.playlistName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
              {item.mediaCount} track{item.mediaCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeletePlaylist(item)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Playlists</Text>
        {!isCreating && (
          <TouchableOpacity
            onPress={() => setIsCreating(true)}
            style={[styles.addButton, { backgroundColor: Colors.primary }]}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {isCreating && (
        <Card style={styles.createCard}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Playlist name"
            placeholderTextColor={colors.textSecondary}
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            autoFocus
          />
          <View style={styles.createActions}>
            <TouchableOpacity
              onPress={() => {
                setIsCreating(false);
                setNewPlaylistName('');
              }}
              style={styles.cancelButton}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreatePlaylist}
              style={[styles.createButton, { backgroundColor: Colors.primary }]}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Create</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      <FlatList
        data={playlists}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            title="No playlists yet"
            message="Create a playlist to organize your favorite tracks"
            icon={<Ionicons name="musical-notes" size={48} color={colors.textSecondary} />}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  title: {
    ...Typography.h1,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCard: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  cancelButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  createButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  playlistCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  playlistIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  playlistCount: {
    ...Typography.bodySmall,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});

