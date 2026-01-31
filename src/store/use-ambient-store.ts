import { create } from 'zustand';
import { Vibrant } from 'node-vibrant/browser';

interface AmbientState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  setColors: (primary: string, secondary: string, accent: string) => void;
  setFromImage: (imageUrl: string) => Promise<void>;
  reset: () => void;
}

export const useAmbientStore = create<AmbientState>((set) => ({
  // Default "Aurora" colors (Indigo/Purple/Pink mix)
  primaryColor: 'rgba(99, 102, 241, 0.15)',   // Indigo-500 low opacity
  secondaryColor: 'rgba(168, 85, 247, 0.15)', // Purple-500 low opacity
  accentColor: 'rgba(236, 72, 153, 0.15)',    // Pink-500 low opacity

  setColors: (primary, secondary, accent) => set({ primaryColor: primary, secondaryColor: secondary, accentColor: accent }),

  setFromImage: async (imageUrl) => {
    try {
      const palette = await Vibrant.from(imageUrl).getPalette();
      
      const primary = palette.Vibrant?.hex || '#6366f1';
      const secondary = palette.Muted?.hex || '#a855f7';
      const accent = palette.LightVibrant?.hex || '#ec4899';

      // Convert hex to rgba with low opacity for the background blob
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      set({
        primaryColor: hexToRgba(primary, 0.25),   // Slightly stronger than default
        secondaryColor: hexToRgba(secondary, 0.2),
        accentColor: hexToRgba(accent, 0.2),
      });
    } catch (error) {
      console.error("Failed to extract colors", error);
    }
  },

  reset: () => set({
    primaryColor: 'rgba(99, 102, 241, 0.15)',
    secondaryColor: 'rgba(168, 85, 247, 0.15)',
    accentColor: 'rgba(236, 72, 153, 0.15)',
  }),
}));
