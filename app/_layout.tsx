// Root Layout with Theme and Player Providers
// Based on Expo Router SDK 54

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { StatusBar } from 'expo-status-bar';
import { MiniPlayerBar } from '@/components/layout/MiniPlayerBar';
import { initDatabase } from '@/services/StorageService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start (wait for it to complete)
    const initialize = async () => {
      try {
        await initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initialize();
  }, []);

  return (
    <ThemeProvider>
      <PlayerProvider>
        <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="folder/[path]" options={{ headerShown: false }} />
          <Stack.Screen name="player/audio" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="player/video" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
        </Stack>
          <MiniPlayerBar />
          <StatusBar style="auto" />
        </View>
      </PlayerProvider>
    </ThemeProvider>
  );
}
