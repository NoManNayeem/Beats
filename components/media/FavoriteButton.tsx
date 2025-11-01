// Favorite Button Component - Add/remove favorites
// Based on Expo SDK 54 (2025) best practices

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { isFavorite, addFavorite, removeFavorite } from '@/services/StorageService';
import { MediaFile } from '@/types/media';
import * as Haptics from 'expo-haptics';

interface FavoriteButtonProps {
  media: MediaFile;
  size?: number;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  media,
  size = 24,
}) => {
  const { colors } = useTheme();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const isFav = await isFavorite(media.path);
        setFavorited(isFav);
      } catch (error) {
        console.error('Failed to check favorite:', error);
      } finally {
        setLoading(false);
      }
    };
    checkFavorite();
  }, [media.path]);

  const handleToggle = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (favorited) {
        await removeFavorite(media.path);
        setFavorited(false);
      } else {
        await addFavorite(media.path);
        setFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <TouchableOpacity onPress={handleToggle} style={styles.button}>
      <Ionicons
        name={favorited ? 'heart' : 'heart-outline'}
        size={size}
        color={favorited ? Colors.accent : colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

