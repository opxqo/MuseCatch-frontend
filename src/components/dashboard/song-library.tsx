"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download, Trash2, Cloud, Music, MoreVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Song } from "@/types/api";
import { getSongs, deleteFile } from "@/lib/api";

export function SongLibrary() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchSongs = useCallback(async (searchQuery?: string) => {
    try {
      const res = await getSongs({
        limit: 50,
        search: searchQuery || undefined,
      });
      if (res.code === 0 && res.data) {
        setSongs(res.data.items);
      }
    } catch {
      toast.error("加载歌曲库失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchSongs(search);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (song: Song) => {
    try {
      const res = await deleteFile(song.filename);
      if (res.code === 0) {
        toast.success(`已删除: ${song.title}`);
        fetchSongs(search);
      } else {
        toast.error(res.message || "删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
  };

  const handleDownload = (song: Song) => {
    // Open download URL in new tab
    window.open(`/downloads/${encodeURIComponent(song.filename)}`, "_blank");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
         <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">歌曲库</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            共 {songs.length} 首歌曲
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索歌曲..."
            className="pl-9 h-10 md:h-9 rounded-xl md:rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 transition-all text-base md:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {search ? "未找到匹配的歌曲" : "歌曲库为空"}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {search ? "尝试其他关键词" : "下载歌曲后将显示在这里"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl overflow-hidden shadow-sm">
            <TooltipProvider delayDuration={300}>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/60">
                    <TableHead className="w-[60px] pl-6"></TableHead>
                    <TableHead className="w-auto">歌曲标题</TableHead>
                    <TableHead className="w-[70px]">格式</TableHead>
                    <TableHead className="w-[90px]">大小</TableHead>
                    <TableHead className="w-[80px]">来源</TableHead>
                    <TableHead className="w-[60px]">云同步</TableHead>
                    <TableHead className="w-[100px] text-right pr-6">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {songs.map((song) => (
                    <TableRow key={song.id} className="group hover:bg-accent/30 border-border/60 transition-colors">
                      <TableCell className="pl-6">
                        <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Music className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate max-w-[300px] cursor-default">
                              {song.title}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[400px]">
                            <p className="break-all">{song.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <span className="uppercase text-[10px] font-bold text-muted-foreground border border-border px-1.5 py-0.5 rounded tracking-wider">
                          {song.file_ext.replace(".", "")}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums text-sm">{formatSize(song.file_size)}</TableCell>
                      <TableCell className="capitalize text-muted-foreground text-sm">{song.source}</TableCell>
                      <TableCell>
                        {song.webdav_uploaded ? (
                          <Cloud className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Cloud className="h-4 w-4 text-muted-foreground/20" />
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 rounded-full hover:bg-background hover:text-foreground"
                             onClick={() => handleDownload(song)}
                           >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            onClick={() => handleDelete(song)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden space-y-2">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center gap-3 bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl p-3 shadow-sm active:bg-accent/50 transition-colors">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-muted-foreground">
                  <Music className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate pr-2">{song.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="bg-secondary/50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{song.file_ext.replace(".", "")}</span>
                    <span>{formatSize(song.file_size)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                   {song.webdav_uploaded && (
                     <Cloud className="h-3 w-3 text-blue-500" />
                   )}
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-xl">
                      <DropdownMenuItem onClick={() => handleDownload(song)}>
                        <Download className="mr-2 h-4 w-4" /> 下载
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                        onClick={() => handleDelete(song)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> 删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
