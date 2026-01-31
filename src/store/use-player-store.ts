import { create } from 'zustand';

export interface Track {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  duration: number;
}

interface PlayerState {
  isPlaying: boolean;
  isVisible: boolean;
  currentTrack: Track | null;
  progress: number; // 0-100
  
  play: (track: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  close: () => void;
  setProgress: (progress: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  isVisible: true, // Default true for demo
  currentTrack: {
    id: 1,
    title: "七里香",
    artist: "周杰伦",
    coverUrl: "https://y.qq.com/music/photo_new/T002R300x300M000003dfRzD1cbcKz.jpg?max_age=2592000",
    duration: 299
  },
  progress: 30,

  play: (track) => set({ isPlaying: true, isVisible: true, currentTrack: track }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  close: () => set({ isVisible: false, isPlaying: false }),
  setProgress: (progress) => set({ progress }),
}));
