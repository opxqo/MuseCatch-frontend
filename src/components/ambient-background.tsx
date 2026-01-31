"use client";

import { useEffect, useRef } from "react";
import { useAmbientStore } from "@/store/use-ambient-store";

export function AmbientBackground() {
  const { primaryColor, secondaryColor, accentColor } = useAmbientStore();
  
  // Use a canvas or just a div with CSS transition? CSS transition is easier and smoother for colors.
  // We want a "blob" effect. We can layer multiple radial gradients.

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-background transition-colors duration-1000">
      {/* Primary Blob */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-60 mix-blend-multiply dark:mix-blend-normal transition-all duration-[2000ms] ease-in-out animate-blob"
        style={{ backgroundColor: primaryColor }}
      />
      
      {/* Secondary Blob */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-60 mix-blend-multiply dark:mix-blend-normal transition-all duration-[2000ms] ease-in-out animate-blob animation-delay-2000"
        style={{ backgroundColor: secondaryColor }}
      />
      
      {/* Accent Blob */}
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-60 mix-blend-multiply dark:mix-blend-normal transition-all duration-[2000ms] ease-in-out animate-blob animation-delay-4000"
        style={{ backgroundColor: accentColor }}
      />

      {/* Noise Texture Overlay for "Grainy" look (optional, adds texture) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("/noise.png")' }}></div>
    </div>
  );
}
