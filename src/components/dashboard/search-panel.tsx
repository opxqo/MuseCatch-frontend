"use client";

import { useState } from "react";
import { Search, Download, Disc, CheckCircle2, Music2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SourceType } from "@/types/api";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceType | "all">("all");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!query.trim()) {
      toast.error("请输入歌曲名称");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`已开始下载: ${query}`);
      setQuery("");
    }, 1000);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto py-4 md:py-16 px-2 md:px-4">
      {/* Background Gradient Blob - Only on Desktop */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10 rounded-full opacity-70 pointer-events-none" />

      {/* Main Card */}
      <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-xl dark:shadow-black/30 rounded-3xl p-5 md:p-10">
        
        {/* Header */}
        <div className="text-center space-y-1 md:space-y-2 mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground/90">
            音乐搜索
          </h1>
          <p className="text-muted-foreground text-xs md:text-base font-medium opacity-80">
            全网无损音源 · 一键极速下载
          </p>
        </div>

        {/* Search Bar */}
        <div className="space-y-3 md:space-y-6">
          <div className="relative group bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl md:rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20">
            
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-5 flex items-center pointer-events-none z-10">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
            </div>

            {/* Input */}
            <Input 
              placeholder="搜索歌曲、歌手..." 
              className="pl-9 md:pl-12 pr-20 md:pr-32 h-12 md:h-16 text-sm md:text-lg rounded-xl md:rounded-2xl border-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDownload()}
            />

            {/* Source Select */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              <div className="h-5 md:h-8 w-[1px] bg-zinc-300/50 dark:bg-zinc-700/50" />
              <Select value={source} onValueChange={(v: any) => setSource(v)}>
                <SelectTrigger className="w-[70px] md:w-[110px] h-9 md:h-12 rounded-lg md:rounded-xl border-none bg-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 focus:ring-0 transition-colors text-xs md:text-sm font-medium text-muted-foreground">
                  <SelectValue placeholder="来源" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/20 dark:border-white/10 shadow-xl backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90">
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="qq">QQ音乐</SelectItem>
                  <SelectItem value="kugou">酷狗</SelectItem>
                  <SelectItem value="kuwo">酷我</SelectItem>
                  <SelectItem value="netease">网易云</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Download Button */}
          <Button 
            size="lg" 
            className="w-full h-11 md:h-14 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all bg-primary text-primary-foreground"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <Disc className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            立即下载
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-zinc-200/50 dark:border-white/5 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center space-y-0.5">
            <div className="flex items-center gap-1.5 text-foreground/80">
              <Music2 className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-lg md:text-2xl font-bold tracking-tight">12.5k</span>
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">已下载歌曲</span>
          </div>
          <div className="flex flex-col items-center justify-center space-y-0.5 border-l border-zinc-200/50 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-foreground/80">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-lg md:text-2xl font-bold tracking-tight">99.9%</span>
            </div>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">下载成功率</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
