// Media utility functions

import * as FileSystem from 'expo-file-system';
import { MediaFile, Folder } from '@/types/media';
import { isMediaFile, getMediaType } from '@/constants/media';

/**
 * Generate unique ID for media file based on path
 */
export const generateMediaId = (path: string): string => {
  return path.replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format duration (seconds) to MM:SS or HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Extract filename from path
 */
export const getFileName = (path: string): string => {
  return path.split('/').pop() || path;
};

/**
 * Get folder path from file path
 */
export const getFolderPath = (path: string): string => {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '/';
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
};

/**
 * Create MediaFile object from file path and info
 */
export const createMediaFile = async (
  path: string,
  info: FileSystem.FileInfo
): Promise<MediaFile | null> => {
  if (!info.exists) return null;
  
  const filename = getFileName(path);
  if (!isMediaFile(filename)) return null;
  
  const type = getMediaType(filename);
  if (!type) return null;
  
  return {
    id: generateMediaId(path),
    path,
    name: filename,
    type,
    size: info.size || 0,
    dateModified: info.modificationTime || Date.now(),
    folderPath: getFolderPath(path),
    extension: getFileExtension(filename),
  };
};

/**
 * Sort media files
 */
export const sortMediaFiles = (
  files: MediaFile[],
  sortBy: 'name' | 'date' | 'size' | 'duration'
): MediaFile[] => {
  const sorted = [...files];
  
  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'date':
      sorted.sort((a, b) => b.dateModified - a.dateModified);
      break;
    case 'size':
      sorted.sort((a, b) => b.size - a.size);
      break;
    case 'duration':
      sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
      break;
  }
  
  return sorted;
};

