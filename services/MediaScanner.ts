// Media Scanner Service - Scan device storage for media files
// Based on Expo SDK 54 APIs
// Uses expo-media-library for proper media access on iOS/Android

import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';
import { MediaFile, Folder } from '@/types/media';
import { createMediaFile } from '@/utils/media';
import { isMediaFile, getMediaType } from '@/constants/media';
import { Platform } from 'react-native';

interface ScanProgress {
  currentPath: string;
  filesFound: number;
  foldersFound: number;
}

type ScanProgressCallback = (progress: ScanProgress) => void;

/**
 * Check if running in Expo Go (which doesn't support custom native plugins)
 * Based on Expo SDK 54 - executionEnvironment can be 'storeClient', 'standalone', or 'bare'
 */
const isExpoGo = (): boolean => {
  try {
    return Constants.executionEnvironment === 'storeClient';
  } catch {
    // Fallback: check if Constants.executionEnvironment exists
    return false;
  }
};

/**
 * Request media library permissions
 */
export const requestMediaPermissions = async (): Promise<boolean> => {
  // Expo Go doesn't support expo-media-library with audio permissions
  if (isExpoGo()) {
    console.warn('⚠️ Expo Go detected - media library permissions not available.');
    throw new Error(
      'This app requires a development build for media access.\n\n' +
      'Run: npx expo prebuild && npx expo run:android\n\n' +
      'Or use EAS Build: eas build --profile development --platform android'
    );
  }

  try {
    // Request permissions with only photo and video if audio fails
    // This handles cases where audio permission isn't configured
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (audioError: any) {
      // If audio permission fails, try requesting without it
      if (audioError?.message?.includes('AUDIO') || audioError?.message?.includes('AndroidManifest')) {
        console.warn('Audio permission not available, requesting photo/video only');
        // Request photo/video permissions explicitly
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        return status === 'granted';
      }
      throw audioError;
    }
  } catch (error: any) {
    console.error('Failed to request media permissions:', error);
    
    // Provide helpful error message
    if (error?.message?.includes('AndroidManifest')) {
      throw new Error(
        'This app requires a development build. ' +
        'Please rebuild with: npx expo prebuild && npx expo run:android'
      );
    }
    
    throw error;
  }
};

/**
 * Check media library permissions
 */
export const checkMediaPermissions = async (): Promise<boolean> => {
  // Expo Go doesn't support expo-media-library with audio permissions
  if (isExpoGo()) {
    console.warn('⚠️ Running in Expo Go - media library access is limited. Use a development build for full access.');
    return false;
  }

  try {
    // Try to get permissions - if it fails due to missing AndroidManifest config,
    // we'll catch and return false (user needs to rebuild with proper config)
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error: any) {
    console.error('Failed to check media permissions:', error);
    
    // If error is about missing AndroidManifest config, log helpful message
    if (error?.message?.includes('AndroidManifest')) {
      console.warn(
        '⚠️ expo-media-library requires native build. ' +
        'Run: npx expo prebuild && npx expo run:android (or use EAS Build)'
      );
    }
    
    return false;
  }
};

/**
 * Scan media library using expo-media-library (recommended for iOS/Android)
 */
const scanMediaLibrary = async (
  onProgress?: ScanProgressCallback
): Promise<MediaFile[]> => {
  // Skip MediaLibrary in Expo Go - use FileSystem fallback instead
  if (isExpoGo()) {
    console.warn('⚠️ Expo Go detected - using FileSystem fallback instead of MediaLibrary');
    return [];
  }

  let hasPermission = false;
  try {
    hasPermission = await requestMediaPermissions();
  } catch (error) {
    console.warn('Failed to get media permissions:', error);
    return [];
  }

  if (!hasPermission) {
    console.warn('Media library permission not granted');
    return [];
  }

  const mediaFiles: MediaFile[] = [];
  
  try {
    // Get albums first for better organization
    const albums = await MediaLibrary.getAlbumsAsync();
    const albumMap = new Map<string, string>();
    albums.forEach(album => {
      albumMap.set(album.id, album.title);
    });

    // Get audio assets
    let hasNextPage = true;
    let after: string | undefined;

    while (hasNextPage) {
      const audioAssets = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000, // Get in batches
        after,
      });

      for (const asset of audioAssets.assets) {
        const albumId = asset.albumId || 'unknown';
        const albumName = albumMap.get(albumId) || albumId || 'Unknown Album';
        if (!asset.filename) continue; // Skip if no filename
        const extension = asset.filename.slice(asset.filename.lastIndexOf('.')) || '.mp3';
        
        const mediaFile: MediaFile = {
          id: asset.id,
          path: asset.uri,
          name: asset.filename || `audio_${asset.id}`,
          type: 'audio',
          size: asset.width || 0, // MediaLibrary doesn't provide file size directly
          duration: asset.duration || undefined,
          dateModified: asset.modificationTime || asset.creationTime || Date.now(),
          folderPath: albumName,
          extension,
        };
        mediaFiles.push(mediaFile);

        if (onProgress) {
          onProgress({
            currentPath: asset.uri,
            filesFound: mediaFiles.length,
            foldersFound: 0,
          });
        }
      }

      hasNextPage = audioAssets.hasNextPage;
      after = audioAssets.endCursor;
    }

    // Get video assets
    hasNextPage = true;
    after = undefined;

    while (hasNextPage) {
      const videoAssets = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.video,
        first: 1000, // Get in batches
        after,
      });

      for (const asset of videoAssets.assets) {
        const albumId = asset.albumId || 'unknown';
        const albumName = albumMap.get(albumId) || albumId || 'Unknown Album';
        if (!asset.filename) continue; // Skip if no filename
        const extension = asset.filename.slice(asset.filename.lastIndexOf('.')) || '.mp4';
        
        const mediaFile: MediaFile = {
          id: asset.id,
          path: asset.uri,
          name: asset.filename || `video_${asset.id}`,
          type: 'video',
          size: asset.width || 0,
          duration: asset.duration || undefined,
          dateModified: asset.modificationTime || asset.creationTime || Date.now(),
          folderPath: albumName,
          extension,
        };
        mediaFiles.push(mediaFile);

        if (onProgress) {
          onProgress({
            currentPath: asset.uri,
            filesFound: mediaFiles.length,
            foldersFound: 0,
          });
        }
      }

      hasNextPage = videoAssets.hasNextPage;
      after = videoAssets.endCursor;
    }
  } catch (error) {
    console.error('Error scanning media library:', error);
  }

  return mediaFiles;
};

/**
 * Organize media files into folders based on album/directory
 */
const organizeIntoFolders = (mediaFiles: MediaFile[]): Folder[] => {
  const folderMap = new Map<string, MediaFile[]>();
  
  // Group files by folder/album
  for (const file of mediaFiles) {
    const folderPath = file.folderPath || 'Unknown';
    if (!folderMap.has(folderPath)) {
      folderMap.set(folderPath, []);
    }
    folderMap.get(folderPath)!.push(file);
  }

  // Create folder objects
  const folders: Folder[] = [];
  for (const [path, files] of folderMap.entries()) {
    const audioCount = files.filter(f => f.type === 'audio').length;
    const videoCount = files.filter(f => f.type === 'video').length;
    
    folders.push({
      id: path.replace(/[^a-zA-Z0-9]/g, '_'),
      path,
      name: path === 'Unknown' ? 'Unknown' : path.split('/').pop() || path,
      mediaCount: files.length,
      audioCount,
      videoCount,
      dateModified: Math.max(...files.map(f => f.dateModified)),
    });
  }

  // Sort folders by name
  folders.sort((a, b) => a.name.localeCompare(b.name));

  return folders;
};

/**
 * Scan device storage for media files
 * Uses expo-media-library on mobile, falls back to FileSystem for web/other
 */
export const scanDeviceStorage = async (
  onProgress?: ScanProgressCallback
): Promise<{ files: MediaFile[]; folders: Folder[] }> => {
  let mediaFiles: MediaFile[] = [];

  // Use MediaLibrary for iOS and Android (proper way to access device media)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      mediaFiles = await scanMediaLibrary(onProgress);
    } catch (error) {
      console.error('Failed to scan media library:', error);
      // Fallback to FileSystem if MediaLibrary fails
    }
  }

  // Fallback: Try FileSystem scanning (for web or if MediaLibrary didn't work)
  if (mediaFiles.length === 0) {
    try {
      const directoriesToScan: string[] = [];
      
      if (FileSystem.documentDirectory) {
        directoriesToScan.push(FileSystem.documentDirectory);
      }
      if (FileSystem.cacheDirectory) {
        directoriesToScan.push(FileSystem.cacheDirectory);
      }

      for (const dir of directoriesToScan) {
        if (!dir) continue;
        try {
          const files = await scanDirectory(dir, onProgress);
          mediaFiles.push(...files);
        } catch (error) {
          console.warn(`Failed to scan ${dir}:`, error);
        }
      }
    } catch (error) {
      console.error('FileSystem scanning failed:', error);
    }
  }

  // Organize into folders
  const folders = organizeIntoFolders(mediaFiles);

  return { files: mediaFiles, folders };
};

/**
 * Recursively scan directory for media files (FileSystem fallback)
 */
const scanDirectory = async (
  dirPath: string,
  onProgress?: ScanProgressCallback,
  maxDepth: number = 10,
  currentDepth: number = 0
): Promise<MediaFile[]> => {
  if (currentDepth >= maxDepth) return [];
  
  const mediaFiles: MediaFile[] = [];
  
  try {
    const info = await FileSystem.getInfoAsync(dirPath);
    if (!info.exists || !info.isDirectory) return mediaFiles;
    
    const items = await FileSystem.readDirectoryAsync(dirPath);
    
    for (const item of items) {
      const itemPath = `${dirPath}/${item}`;
      
      try {
        const itemInfo = await FileSystem.getInfoAsync(itemPath);
        
        if (itemInfo.isDirectory) {
          if (onProgress) {
            onProgress({
              currentPath: itemPath,
              filesFound: mediaFiles.length,
              foldersFound: 0,
            });
          }
          
          const subFiles = await scanDirectory(
            itemPath,
            onProgress,
            maxDepth,
            currentDepth + 1
          );
          mediaFiles.push(...subFiles);
        } else if (itemInfo.exists && isMediaFile(item)) {
          const mediaFile = await createMediaFile(itemPath, itemInfo);
          if (mediaFile) {
            mediaFiles.push(mediaFile);
            
            if (onProgress) {
              onProgress({
                currentPath: itemPath,
                filesFound: mediaFiles.length,
                foldersFound: 0,
              });
            }
          }
        }
      } catch (error) {
        // Skip files/directories that can't be accessed
        console.warn(`Skipping ${itemPath}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return mediaFiles;
};

/**
 * Scan a specific folder
 */
export const scanFolder = async (
  folderPath: string
): Promise<MediaFile[]> => {
  // For MediaLibrary-based scanning, filter by folder path
  const { files } = await scanDeviceStorage();
  return files.filter(f => f.folderPath === folderPath);
};

/**
 * Refresh media library (rescan)
 */
export const refreshMediaLibrary = async (
  onProgress?: ScanProgressCallback
): Promise<{ files: MediaFile[]; folders: Folder[] }> => {
  return await scanDeviceStorage(onProgress);
};
