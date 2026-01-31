"use client";

import { cn } from "@/lib/utils";
import { Search, ListMusic, Library } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const items = [
    { id: "search", label: "搜索", icon: Search },
    { id: "queue", label: "队列", icon: ListMusic },
    { id: "library", label: "歌曲库", icon: Library },
  ];

  return (
    <nav className="md:hidden shrink-0 border-t bg-background/95 backdrop-blur-xl z-[100]">
      <div 
        className="flex justify-around items-center h-16"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors duration-200 active:opacity-70",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
