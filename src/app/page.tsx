"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchPanel } from "@/components/dashboard/search-panel";
import { QueueList } from "@/components/dashboard/queue-list";
import { SongLibrary } from "@/components/dashboard/song-library";
import { ModeToggle } from "@/components/mode-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { Github } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div className="h-[100dvh] bg-background flex flex-col font-sans selection:bg-primary/20 overflow-hidden">
      {/* Top Navigation (Desktop & Mobile) */}
      <header className="shrink-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/40">
        <div className="container mx-auto py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white text-sm font-extrabold">MC</span>
            </div>
            <span className="hidden md:inline-block">MuseCatch</span>
          </div>
          
          <nav className="flex items-center gap-2 text-sm font-medium">
             <a 
              href="https://github.com/opxqo/musecatch-backend" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground hidden md:block"
            >
              <Github className="h-5 w-5" />
            </a>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto p-4 pb-20 md:pb-4 md:py-12 md:px-8 max-w-5xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-12">
            
            {/* Desktop Tabs Navigation */}
            <div className="hidden md:flex justify-center">
              <TabsList className="grid w-full max-w-sm grid-cols-3 h-11 p-1 bg-muted/50 backdrop-blur-sm rounded-full border border-border/50 shadow-sm">
                <TabsTrigger 
                  value="search" 
                  className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300"
                >
                  搜索下载
                </TabsTrigger>
                <TabsTrigger 
                  value="queue" 
                  className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300"
                >
                  下载队列
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  className="rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300"
                >
                  歌曲库
                </TabsTrigger>
              </TabsList>
            </div>

            <div>
              <TabsContent value="search" className="mt-0 outline-none">
                <SearchPanel />
              </TabsContent>

              <TabsContent value="queue" className="mt-0 outline-none">
                <QueueList />
              </TabsContent>

              <TabsContent value="library" className="mt-0 outline-none">
                <SongLibrary />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      {/* Mobile Bottom Navigation - Fixed at viewport bottom */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Desktop Footer */}
      <footer className="hidden md:block shrink-0 border-t border-border/40 py-8 text-center text-sm text-muted-foreground bg-muted/20">
        <p className="mb-2">© 2026 MuseCatch. Open Source.</p>
        <p className="text-xs opacity-60">Powered by Telegram Bot & WebDAV</p>
      </footer>
    </div>
  );
}
