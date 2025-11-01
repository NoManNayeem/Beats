// Media type definitions for Beats app

export type MediaType = 'audio' | 'video';

export interface MediaFile {
  id: string;
  path: string;
  name: string;
  type: MediaType;
  size: number;
  duration?: number; // in seconds
  dateModified: number;
  folderPath: string;
  extension: string;
  thumbnailUri?: string; // For videos
}

export interface Folder {
  id: string;
  path: string;
  name: string;
  parentPath?: string;
  mediaCount: number;
  audioCount: number;
  videoCount: number;
  thumbnailUri?: string;
  dateModified: number;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  mediaCount: number;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  mediaPath: string;
  position: number;
}

export interface Favorite {
  id: string;
  mediaPath: string;
  addedAt: number;
}

export interface RecentlyPlayed {
  id: string;
  mediaPath: string;
  playedAt: number;
}

export type SortOption = 'name' | 'date' | 'size' | 'duration';
export type ViewMode = 'grid' | 'list';

