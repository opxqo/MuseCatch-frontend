"use client";

import { useState } from "react";
import { Search, Download, Trash2, Cloud, HardDrive, Music, Play, MoreVertical } from "lucide-react";
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
import { Song } from "@/types/api";

const MOCK_SONGS: Song[] = [
  {
    id: 1,
    title: "七里香",
    source: "qq",
    filename: "七里香_-_周杰伦_-_QQ.mp3",
    file_size: 10485760,
    file_ext: ".mp3",
    webdav_uploaded: true,
    created_at: "2026-01-31T15:00:00",
  },
  {
    id: 2,
    title: "Mojito",
    source: "kugou",
    filename: "Mojito_-_周杰伦_-_KG.flac",
    file_size: 32485760,
    file_ext: ".flac",
    webdav_uploaded: false,
    created_at: "2026-01-30T12:00:00",
  },
  {
    id: 3,
    title: "反方向的钟",
    source: "qq",
    filename: "反方向的钟_-_周杰伦_-_QQ.flac",
    file_size: 42485760,
    file_ext: ".flac",
    webdav_uploaded: true,
    created_at: "2026-01-29T12:00:00",
  },
];

export function SongLibrary() {
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [search, setSearch] = useState("");

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
         <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">歌曲库</h2>
          <p className="text-xs md:text-sm text-muted-foreground">已下载的音乐列表</p>
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

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60">
              <TableHead className="w-[60px] pl-6"></TableHead>
              <TableHead>歌曲标题</TableHead>
              <TableHead>格式</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>云同步</TableHead>
              <TableHead className="text-right pr-6">操作</TableHead>
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
                <TableCell className="font-medium text-base">{song.title}</TableCell>
                <TableCell>
                  <span className="uppercase text-[10px] font-bold text-muted-foreground border border-border px-1.5 py-0.5 rounded tracking-wider">
                    {song.file_ext.replace(".", "")}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{formatSize(song.file_size)}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{song.source}</TableCell>
                <TableCell>
                  {song.webdav_uploaded ? (
                    <Cloud className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Cloud className="h-4 w-4 text-muted-foreground/20" />
                  )}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" /> 下载
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                    <Trash2 className="mr-2 h-4 w-4" /> 删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
