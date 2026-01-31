export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Pagination<T> {
  items: T[];
  count?: number; // Sometimes used as total count
  total?: number; // Sometimes used as total count
  skip?: number;
  limit?: number;
}

export type SourceType = 'qq' | 'kugou' | 'kuwo' | 'netease';

export interface Source {
  key: SourceType;
  name: string;
}

export interface QueueItem {
  id: number;
  song_name: string;
  source: SourceType | null;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  priority: number;
  error_message: string | null;
  created_at: string;
}

export interface QueueStats {
  pending: number;
  downloading: number;
  completed: number;
  failed: number;
  total: number;
}

export interface Song {
  id: number;
  title: string;
  artist_id?: number;
  source: SourceType;
  filename: string;
  file_size: number;
  file_ext: string;
  webdav_uploaded: boolean;
  created_at: string;
}

export interface CreateTaskRequest {
  song_name: string;
  source?: SourceType;
}

export interface CreateTaskResponse {
  task_id: string;
  song_name: string;
}

export interface TaskProgressEvent {
  percent: number;
  status: string;
  complete: boolean;
  result?: {
    success: boolean;
    filename?: string;
    error?: string;
  } | null;
}
