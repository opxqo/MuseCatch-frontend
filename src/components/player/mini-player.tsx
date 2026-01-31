"use client";

import { useEffect, useRef } from "react";
import { Play, Pause, X, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/use-player-store";
import { Button } from "@/components/ui/button";

export function MiniPlayer() {
  const { isPlaying, isVisible, currentTrack, togglePlay, close } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Waveform Animation
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const bars = 20;
    const gap = 2;
    const barWidth = (canvas.width - (bars - 1) * gap) / bars;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(99, 102, 241, 0.8)"; // Indigo color

      for (let i = 0; i < bars; i++) {
        // Generate random height for each bar to simulate waveform
        // Smooth it out a bit with Math.sin
        const time = Date.now() / 200;
        const height = Math.abs(Math.sin(time + i * 0.5)) * canvas.height * 0.8 + canvas.height * 0.2;
        
        const x = i * (barWidth + gap);
        const y = (canvas.height - height) / 2;
        
        // Draw rounded bar
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  if (!isVisible || !currentTrack) return null;

  return (
    <div className={cn(
      "fixed z-[90] transition-all duration-500 ease-in-out",
      // Desktop positioning: Bottom Right
      "md:bottom-8 md:right-8 md:w-[320px]",
      // Mobile positioning: Above BottomNav (BottomNav is ~64px + safe area)
      "bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)] left-4 right-4 md:left-auto"
    )}>
      <div className="relative group overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-indigo-500/10 rounded-full h-16 flex items-center pr-2 pl-2">
        
        {/* Progress Bar (Background) */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary/20 w-full">
          <div className="h-full bg-primary w-[30%]" />
        </div>

        {/* Album Art (Rotating) */}
        <div className="relative shrink-0 mr-3">
          <div className={cn(
            "w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden border border-white/10 shadow-sm",
            isPlaying && "animate-spin-slow" // We need to add this animation
          )}>
            {/* Placeholder for album art */}
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {currentTrack.title[0]}
            </div>
          </div>
          {/* Center hole for vinyl effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/90 dark:bg-zinc-900 rounded-full border border-zinc-100 dark:border-zinc-800" />
        </div>

        {/* Info & Waveform */}
        <div className="flex-1 min-w-0 flex flex-col justify-center mr-2">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-sm font-semibold truncate pr-2">{currentTrack.title}</h3>
            {/* Waveform Canvas */}
            <canvas 
              ref={canvasRef} 
              width={60} 
              height={20} 
              className={cn("opacity-50", !isPlaying && "opacity-20")} 
            />
          </div>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
