"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2, Pause, Play, Music, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueueItem } from "@/types/api";

// Mock data
const MOCK_QUEUE: QueueItem[] = [
  {
    id: 1,
    song_name: "七里香 - 周杰伦",
    source: "qq",
    status: "downloading",
    priority: 10,
    error_message: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    song_name: "江南 - 林俊杰",
    source: "kugou",
    status: "pending",
    priority: 5,
    error_message: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    song_name: "十年 - 陈奕迅",
    source: "kuwo",
    status: "failed",
    priority: 0,
    error_message: "Search timeout",
    created_at: new Date().toISOString(),
  },
];

export function QueueList() {
  const [items, setItems] = useState<QueueItem[]>(MOCK_QUEUE);
  const [progress, setProgress] = useState(45);

  // Simulate progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "downloading":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-none font-medium px-2 py-0.5">下载中</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-none font-medium px-2 py-0.5">已完成</Badge>;
      case "failed":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-none font-medium px-2 py-0.5">失败</Badge>;
      default:
        return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/20 border-none font-medium px-2 py-0.5">等待中</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">下载队列</h2>
          <p className="text-xs md:text-sm text-muted-foreground">管理当前和历史任务</p>
        </div>
        <Button variant="ghost" size="sm" className="h-9 rounded-full hover:bg-accent/50 active:scale-95 transition-all">
          <RefreshCw className="mr-2 h-4 w-4" /> 刷新
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60">
              <TableHead className="w-[80px] pl-6">ID</TableHead>
              <TableHead>歌曲名称</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right pr-6">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="group hover:bg-accent/30 border-border/60 transition-colors">
                <TableCell className="font-medium text-muted-foreground pl-6">#{item.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 py-1">
                    <span className="font-medium">{item.song_name}</span>
                    {item.status === "downloading" && (
                      <div className="w-[80%] flex items-center gap-3">
                        <Progress value={progress} className="h-1.5 bg-secondary/50" />
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">{progress}%</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-sm font-medium">{item.source || "Auto"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(item.status)}
                  {item.error_message && (
                    <div className="flex items-center gap-1 text-xs text-red-500/80 mt-1.5 font-medium max-w-[200px] truncate">
                      <AlertCircle className="h-3 w-3" />
                      {item.error_message}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.status === "pending" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background hover:text-foreground">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
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

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Music className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{item.song_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="bg-secondary/50 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{item.source || "Auto"}</span>
                    <span>#{item.id}</span>
                  </div>
                </div>
              </div>
              {getStatusBadge(item.status)}
            </div>

            {item.status === "downloading" && (
              <div className="mb-3 space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>下载中...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-secondary/50" />
              </div>
            )}

            {item.error_message && (
              <div className="mb-3 flex items-center gap-1.5 text-xs text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                <AlertCircle className="h-3.5 w-3.5" />
                {item.error_message}
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-3">
               {item.status === "pending" && (
                  <Button variant="outline" size="sm" className="h-8 rounded-full text-xs font-medium border-border/50">
                    <Pause className="mr-1.5 h-3 w-3" /> 暂停
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="mr-1.5 h-3 w-3" /> 删除
                </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
