import { create } from 'zustand';
import { getStreamUrl } from '@/lib/api';
import { Song } from '@/types/api';

export interface Track {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  duration: number;
  streamUrl: string;
}

interface PlayerState {
  // State
  isPlaying: boolean;
  isVisible: boolean;
  isLoading: boolean;
  currentTrack: Track | null;
  progress: number; // 0-100
  currentTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0-1
  
  // Audio element reference (managed outside React)
  audioElement: HTMLAudioElement | null;
  
  // Actions
  play: (track: Track) => void;
  playSong: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  close: () => void;
  seek: (time: number) => void;
  seekPercent: (percent: number) => void;
  setVolume: (volume: number) => void;
  
  // Internal actions (called by audio event handlers)
  _setProgress: (progress: number) => void;
  _setCurrentTime: (time: number) => void;
  _setDuration: (duration: number) => void;
  _setLoading: (loading: boolean) => void;
  _setPlaying: (playing: boolean) => void;
  _initAudio: () => void;
}

// Create audio element singleton (client-side only)
let audioInstance: HTMLAudioElement | null = null;

function getAudioElement(): HTMLAudioElement {
  if (typeof window === 'undefined') {
    throw new Error('Audio element can only be created on client side');
  }
  if (!audioInstance) {
    audioInstance = new Audio();
    audioInstance.preload = 'metadata';
  }
  return audioInstance;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // Initial state
  isPlaying: false,
  isVisible: false,
  isLoading: false,
  currentTrack: null,
  progress: 0,
  currentTime: 0,
  duration: 0,
  volume: 1,
  audioElement: null,

  _initAudio: () => {
    if (typeof window === 'undefined') return;
    
    const audio = getAudioElement();
    
    // Set up event listeners
    audio.ontimeupdate = () => {
      const { duration } = get();
      if (duration > 0) {
        const progress = (audio.currentTime / duration) * 100;
        set({ 
          progress, 
          currentTime: audio.currentTime 
        });
      }
    };

    audio.ondurationchange = () => {
      set({ duration: audio.duration || 0 });
    };

    audio.onloadedmetadata = () => {
      set({ 
        duration: audio.duration || 0,
        isLoading: false 
      });
    };

    audio.onplay = () => {
      set({ isPlaying: true });
    };

    audio.onpause = () => {
      set({ isPlaying: false });
    };

    audio.onended = () => {
      set({ isPlaying: false, progress: 0, currentTime: 0 });
    };

    audio.onwaiting = () => {
      set({ isLoading: true });
    };

    audio.oncanplay = () => {
      set({ isLoading: false });
    };

    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      set({ isLoading: false, isPlaying: false });
    };

    set({ audioElement: audio });
  },

  play: (track) => {
    const state = get();
    
    // Initialize audio if needed
    if (!state.audioElement) {
      state._initAudio();
    }
    
    const audio = getAudioElement();
    
    // If same track, just resume
    if (state.currentTrack?.id === track.id) {
      audio.play();
      return;
    }
    
    // New track
    set({ 
      currentTrack: track, 
      isVisible: true, 
      isLoading: true,
      progress: 0,
      currentTime: 0,
      duration: track.duration || 0
    });
    
    audio.src = track.streamUrl;
    audio.load();
    audio.play().catch(err => {
      console.error('Failed to play:', err);
      set({ isLoading: false });
    });
  },

  playSong: (song) => {
    // Parse artist from filename (format: "Title-Artist-Source.ext")
    const parseArtist = (filename: string): string => {
      const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
      const parts = nameWithoutExt.split("-");
      if (parts.length >= 2) {
        return parts[parts.length - 2] || "未知歌手";
      }
      return "未知歌手";
    };

    const track: Track = {
      id: song.id,
      title: song.title,
      artist: parseArtist(song.filename),
      duration: 0, // Will be set from audio metadata
      streamUrl: getStreamUrl(song.id),
    };
    get().play(track);
  },

  pause: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
    }
    set({ isPlaying: false });
  },

  resume: () => {
    const audio = get().audioElement;
    if (audio && get().currentTrack) {
      audio.play().catch(console.error);
    }
  },

  togglePlay: () => {
    const state = get();
    if (state.isPlaying) {
      state.pause();
    } else {
      state.resume();
    }
  },

  close: () => {
    const audio = get().audioElement;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    set({ 
      isVisible: false, 
      isPlaying: false, 
      progress: 0, 
      currentTime: 0 
    });
  },

  seek: (time) => {
    const audio = get().audioElement;
    if (audio) {
      audio.currentTime = time;
      set({ currentTime: time });
    }
  },

  seekPercent: (percent) => {
    const { duration } = get();
    if (duration > 0) {
      const time = (percent / 100) * duration;
      get().seek(time);
    }
  },

  setVolume: (volume) => {
    const audio = get().audioElement;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  // Internal setters
  _setProgress: (progress) => set({ progress }),
  _setCurrentTime: (time) => set({ currentTime: time }),
  _setDuration: (duration) => set({ duration }),
  _setLoading: (loading) => set({ isLoading: loading }),
  _setPlaying: (playing) => set({ isPlaying: playing }),
}));
