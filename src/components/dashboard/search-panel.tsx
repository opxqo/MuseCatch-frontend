"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Download, Disc, CheckCircle2, Music2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SourceType, TaskProgressEvent } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAmbientStore } from "@/store/use-ambient-store";
import { createTask, subscribeTaskProgress, getSongStats, getQueueCurrent } from "@/lib/api";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceType | "all">("all");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<TaskProgressEvent | null>(null);
  const [totalSongs, setTotalSongs] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedStatusRef = useRef<string>("");  // Track notified status to avoid duplicates
  const { setColors, reset } = useAmbientStore();

  // Poll for current download progress (used when page is refreshed during download)
  const startProgressPolling = useCallback(() => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await getQueueCurrent();
        if (res.code === 0 && res.data) {
          if (res.data.downloading) {
            setDownloadProgress({
              percent: res.data.percent,
              status: res.data.status,
              complete: false,
              result: null,
            });
          } else {
            // Download finished
            setLoading(false);
            setDownloadProgress(null);
            setQuery("");
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            // Refresh song count
            getSongStats().then((statsRes) => {
              if (statsRes.code === 0 && statsRes.data) {
                setTotalSongs(statsRes.data.total);
              }
            });
            toast.success("下载完成");
          }
        }
      } catch {
        // Silently fail polling
      }
    }, 1000);
  }, []);

  // Fetch song stats and check for active downloads on mount
  useEffect(() => {
    // Fetch song stats
    getSongStats()
      .then((res) => {
        if (res.code === 0 && res.data) {
          setTotalSongs(res.data.total);
        }
      })
      .catch(() => {
        // Silently fail - will show placeholder
      });

    // Check if there's an active download (restore state after refresh)
    getQueueCurrent()
      .then((res) => {
        if (res.code === 0 && res.data?.downloading && res.data.queue_id) {
          const { song_name, percent, status } = res.data;
          setQuery(song_name || "");
          setLoading(true);
          setDownloadProgress({
            percent: percent,
            status: status,
            complete: false,
            result: null,
          });
          
          // Start polling for progress updates
          startProgressPolling();
        }
      })
      .catch(() => {
        // Silently fail
      });
  }, [startProgressPolling]);

  // Cleanup EventSource and polling on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Demo: Change colors based on query keywords
    if (query.includes("周杰伦") || query.includes("Jay")) {
      setColors('rgba(236, 72, 153, 0.25)', 'rgba(168, 85, 247, 0.2)', 'rgba(99, 102, 241, 0.2)'); // Pink/Purple
    } else if (query.includes("Coldplay") || query.includes("五月天")) {
      setColors('rgba(59, 130, 246, 0.25)', 'rgba(147, 51, 234, 0.2)', 'rgba(16, 185, 129, 0.2)'); // Blue/Cyan
    } else if (query.includes("Eminem") || query.includes("Linkin Park")) {
      setColors('rgba(239, 68, 68, 0.25)', 'rgba(249, 115, 22, 0.2)', 'rgba(0, 0, 0, 0.2)'); // Red/Orange
    } else if (query.length === 0) {
      reset();
    }
  }, [query, setColors, reset]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!query.trim()) {
      toast.error("请输入歌曲名称");
      return;
    }

    if (loading) return;

    setLoading(true);
    setDownloadProgress(null);

    try {
      console.log("[SearchPanel] Creating task for:", query.trim());
      const response = await createTask({
        song_name: query.trim(),
        source: source === "all" ? undefined : source,
      });

      console.log("[SearchPanel] Create task response:", response);

      if (response.code !== 0) {
        toast.error(response.message || "创建任务失败");
        setLoading(false);
        return;
      }

      const { task_id, song_name } = response.data;
      toast.info(`开始下载: ${song_name}`);
      console.log("[SearchPanel] Subscribing to SSE for task:", task_id);

      // Subscribe to SSE progress
      eventSourceRef.current?.close();
      notifiedStatusRef.current = "";  // Reset notification tracking
      
      eventSourceRef.current = subscribeTaskProgress(
        task_id,
        (event) => {
          console.log("[SearchPanel] SSE progress event:", event);
          setDownloadProgress(event);

          // Show toast for key status changes (only once per status type)
          if (event.status.includes("上传") && !notifiedStatusRef.current.includes("upload")) {
            toast.info("正在上传到云端...", { duration: 3000 });
            notifiedStatusRef.current += "upload";
          }

          if (event.complete) {
            setLoading(false);
            notifiedStatusRef.current = "";  // Reset for next download
            if (event.result?.success) {
              toast.success(`下载完成: ${song_name}`);
              setQuery("");
              setIsFocused(false);
              // Refresh song count
              getSongStats().then((res) => {
                if (res.code === 0 && res.data) {
                  setTotalSongs(res.data.total);
                }
              });
            } else {
              toast.error(`下载失败: ${event.result?.message || event.result?.error || "未知错误"}`);
            }
            setDownloadProgress(null);
          }
        },
        (error) => {
          console.error("[SearchPanel] SSE error:", error);
          setLoading(false);
          setDownloadProgress(null);
          toast.error("连接中断，请重试");
        }
      );
    } catch (err) {
      console.error("[SearchPanel] Request failed:", err);
      setLoading(false);
      toast.error("网络错误，请检查后端服务");
    }
  }, [query, source, loading]);

  const handleChipClick = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  const popularSearches = ["周杰伦", "陈奕迅", "林俊杰", "Taylor Swift", "Blackpink", "五月天"];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto py-4 md:py-16 px-2 md:px-4">
      {/* Main Card */}
      <div className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-xl dark:shadow-black/30 rounded-3xl p-5 md:p-10 transition-shadow duration-500 ${isFocused ? 'shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/20' : ''}`}>
        
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
          <div className={`relative group bg-zinc-100/50 dark:bg-zinc-800/50 rounded-xl md:rounded-2xl transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/20 bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80'}`}>
            
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-5 flex items-center pointer-events-none z-10">
              <Search className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground/70'}`} />
            </div>

            {/* Input */}
            <Input 
              ref={inputRef}
              placeholder="搜索歌曲、歌手..." 
              className="pl-9 md:pl-12 pr-20 md:pr-32 h-12 md:h-16 text-sm md:text-lg rounded-xl md:rounded-2xl border-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow chip click
              onKeyDown={(e) => e.key === "Enter" && handleDownload()}
              disabled={loading}
            />

            {/* Right Side Controls */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              {/* Shortcut Hint (Desktop only, hidden when focused or typed) */}
              {!isFocused && !query && (
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground/50 mr-2 border border-border/50 px-1.5 py-0.5 rounded-md bg-background/50 pointer-events-none">
                  <span className="text-[10px]">⌘</span>K
                </div>
              )}

              <div className="h-5 md:h-8 w-[1px] bg-zinc-300/50 dark:bg-zinc-700/50" />
              <Select value={source} onValueChange={(v: SourceType | "all") => setSource(v)} disabled={loading}>
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

          {/* Suggestions / History Chips (Collapsible) */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isFocused && !query ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-wrap gap-2 justify-center pt-1 pb-2">
              {popularSearches.map((term) => (
                <Badge 
                  key={term}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors px-3 py-1 text-xs md:text-sm font-normal bg-zinc-100/80 dark:bg-zinc-800/80 border-transparent"
                  onClick={() => handleChipClick(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>

          {/* Download Progress */}
          {downloadProgress && (
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {/* Show clean status without duplicate percentage */}
                  {downloadProgress.status.includes("上传") 
                    ? downloadProgress.status 
                    : downloadProgress.status.replace(/\s*\d+%$/, "")}
                </span>
                <span className="font-medium tabular-nums">{Math.round(downloadProgress.percent)}%</span>
              </div>
              <Progress value={downloadProgress.percent} className="h-2" />
            </div>
          )}
          
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
            {loading ? "下载中..." : "立即下载"}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-zinc-200/50 dark:border-white/5 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center space-y-0.5">
            <div className="flex items-center gap-1.5 text-foreground/80">
              <Music2 className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-lg md:text-2xl font-bold tracking-tight">
                {totalSongs !== null ? formatNumber(totalSongs) : "—"}
              </span>
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
