// Mini Player Bar - Persistent mini player in layout
// Based on Expo SDK 54 (2025) best practices

import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniPlayer } from '@/components/player/MiniPlayer';

export const MiniPlayerBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ paddingBottom: insets.bottom }}>
      <MiniPlayer />
    </View>
  );
};

