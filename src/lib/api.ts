import {
  ApiResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  Pagination,
  QueueItem,
  QueueStats,
  Song,
  Source,
  SourceType,
  TaskProgressEvent,
} from "@/types/api";

// API Base URL - must be set in environment for static export
// In development: http://localhost:8889/api/v1
// In production: https://your-backend.com/api/v1
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8889/api/v1";

// ============================================================
// Health Check
// ============================================================

export interface HealthStatus {
  status: string;
  telegram_connected: boolean;
  webdav_enabled: boolean;
  queue_worker_running: boolean;
}

export interface TelegramStatus {
  connected: boolean;
  user_id?: number;
  username?: string;
  name?: string;
  error?: string;
}

export interface WebDAVStatus {
  connected: boolean;
  remote_path?: string;
  error?: string;
}

export async function getHealth(): Promise<ApiResponse<HealthStatus>> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function getTelegramStatus(): Promise<ApiResponse<TelegramStatus>> {
  const res = await fetch(`${API_BASE}/health/telegram`);
  return res.json();
}

export async function getWebDAVStatus(): Promise<ApiResponse<WebDAVStatus>> {
  const res = await fetch(`${API_BASE}/health/webdav`);
  return res.json();
}

// ============================================================
// Sources
// ============================================================

export async function getSources(): Promise<ApiResponse<{ items: Source[] }>> {
  const res = await fetch(`${API_BASE}/files/sources`);
  return res.json();
}

// ============================================================
// Tasks (Download)
// ============================================================

export async function createTask(
  request: CreateTaskRequest
): Promise<ApiResponse<CreateTaskResponse>> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

/**
 * Subscribe to task progress via SSE
 */
export function subscribeTaskProgress(
  taskId: string,
  onProgress: (event: TaskProgressEvent) => void,
  onError?: (error: Event) => void
): EventSource {
  const eventSource = new EventSource(`${API_BASE}/tasks/${taskId}/progress`);

  // Handle named "progress" events (backend sends: event: progress)
  eventSource.addEventListener("progress", (e) => {
    try {
      const data: TaskProgressEvent = JSON.parse(e.data);
      onProgress(data);
      if (data.complete) {
        eventSource.close();
      }
    } catch (err) {
      console.error("Failed to parse SSE progress event:", err);
    }
  });

  // Also handle generic message events as fallback
  eventSource.onmessage = (e) => {
    try {
      const data: TaskProgressEvent = JSON.parse(e.data);
      onProgress(data);
      if (data.complete) {
        eventSource.close();
      }
    } catch (err) {
      console.error("Failed to parse SSE message event:", err);
    }
  };

  eventSource.onerror = (e) => {
    console.error("SSE connection error:", e);
    onError?.(e);
    eventSource.close();
  };

  return eventSource;
}

// ============================================================
// Queue
// ============================================================

export interface GetQueueParams {
  status?: "pending" | "downloading" | "completed" | "failed";
  limit?: number;
}

export async function getQueue(
  params?: GetQueueParams
): Promise<ApiResponse<{ items: QueueItem[] }>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_BASE}/queue?${queryString}`
    : `${API_BASE}/queue`;

  const res = await fetch(url);
  return res.json();
}

export async function getQueueStats(): Promise<ApiResponse<QueueStats>> {
  const res = await fetch(`${API_BASE}/queue/stats`);
  return res.json();
}

export async function getQueueCurrent(): Promise<
  ApiResponse<{
    downloading: boolean;
    queue_id: number | null;
    song_name: string | null;
    source: SourceType | null;
    percent: number;
    status: string;
    started_at: string | null;
  }>
> {
  const res = await fetch(`${API_BASE}/queue/current`);
  return res.json();
}

export interface AddToQueueRequest {
  songs: string[];
  source?: SourceType | null;
  priority?: number;
}

export async function addToQueue(
  request: AddToQueueRequest
): Promise<ApiResponse<{ count: number; songs: string[] }>> {
  const res = await fetch(`${API_BASE}/queue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function deleteFromQueue(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/queue/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

// ============================================================
// Songs
// ============================================================

export interface GetSongsParams {
  skip?: number;
  limit?: number;
  source?: SourceType;
  search?: string;
}

export async function getSongs(
  params?: GetSongsParams
): Promise<ApiResponse<Pagination<Song>>> {
  const searchParams = new URLSearchParams();
  if (params?.skip !== undefined)
    searchParams.set("skip", params.skip.toString());
  if (params?.limit !== undefined)
    searchParams.set("limit", params.limit.toString());
  if (params?.source) searchParams.set("source", params.source);
  if (params?.search) searchParams.set("search", params.search);

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_BASE}/songs?${queryString}`
    : `${API_BASE}/songs`;

  const res = await fetch(url);
  return res.json();
}

export interface SongStats {
  total: number;
  uploaded: number;
  by_source: Record<SourceType, number>;
}

export async function getSongStats(): Promise<ApiResponse<SongStats>> {
  const res = await fetch(`${API_BASE}/songs/stats`);
  return res.json();
}

// ============================================================
// Files
// ============================================================

export interface FileItem {
  name: string;
  size: number;
  url: string;
}

export async function getFiles(): Promise<
  ApiResponse<{ items: FileItem[]; count: number }>
> {
  const res = await fetch(`${API_BASE}/files`);
  return res.json();
}

export async function deleteFile(filename: string): Promise<ApiResponse<null>> {
  const res = await fetch(
    `${API_BASE}/files/${encodeURIComponent(filename)}`,
    {
      method: "DELETE",
    }
  );
  return res.json();
}

// ============================================================
// Stream (Audio Playback)
// ============================================================

/**
 * Get the stream URL for a song
 * Supports HTTP Range requests for seeking
 * @param songId - The song ID
 * @returns The stream URL (direct backend URL)
 */
export function getStreamUrl(songId: number): string {
  return `${API_BASE}/stream/${songId}`;
}

// ============================================================
// Downloads
// ============================================================

/**
 * Get the download URL for a file
 * @param filename - The filename to download
 * @returns The download URL (direct backend URL)
 */
export function getDownloadUrl(filename: string): string {
  // Extract base URL without /api/v1
  const baseUrl = API_BASE.replace(/\/api\/v1$/, "");
  return `${baseUrl}/downloads/${encodeURIComponent(filename)}`;
}
