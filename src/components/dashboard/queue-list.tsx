"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Trash2, Pause, Music, AlertCircle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
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
import { QueueItem, QueueStats } from "@/types/api";
import { getQueue, getQueueStats, getQueueCurrent, deleteFromQueue } from "@/lib/api";
import { BatchAddDialog } from "./batch-add-dialog";

export function QueueList() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [currentDownload, setCurrentDownload] = useState<{
    queue_id: number | null;
    percent: number;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      const [queueRes, statsRes, currentRes] = await Promise.all([
        getQueue({ limit: 50 }),
        getQueueStats(),
        getQueueCurrent(),
      ]);

      if (queueRes.code === 0 && queueRes.data) {
        setItems(queueRes.data.items);
      }
      if (statsRes.code === 0 && statsRes.data) {
        setStats(statsRes.data);
      }
      if (currentRes.code === 0 && currentRes.data?.downloading) {
        setCurrentDownload({
          queue_id: currentRes.data.queue_id,
          percent: currentRes.data.percent,
          status: currentRes.data.status,
        });
      } else {
        setCurrentDownload(null);
      }
    } catch {
      toast.error("加载队列失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for current download progress every 2s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentRes = await getQueueCurrent();
        if (currentRes.code === 0 && currentRes.data?.downloading) {
          setCurrentDownload({
            queue_id: currentRes.data.queue_id,
            percent: currentRes.data.percent,
            status: currentRes.data.status,
          });
        } else {
          // If was downloading but now idle, refresh the list
          if (currentDownload?.queue_id) {
            fetchData();
          }
          setCurrentDownload(null);
        }
      } catch {
        // Silently fail polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentDownload?.queue_id, fetchData]);

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteFromQueue(id);
      if (res.code === 0) {
        toast.success("已从队列删除");
        fetchData();
      } else {
        toast.error(res.message || "删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
  };

  const getStatusBadge = (status: string, itemId: number) => {
    // Check if this item is currently downloading
    const isCurrentlyDownloading = currentDownload?.queue_id === itemId;
    
    if (isCurrentlyDownloading || status === "downloading") {
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-none font-medium px-2 py-0.5">下载中</Badge>;
    }
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-none font-medium px-2 py-0.5">已完成</Badge>;
      case "failed":
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-none font-medium px-2 py-0.5">失败</Badge>;
      default:
        return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/20 border-none font-medium px-2 py-0.5">等待中</Badge>;
    }
  };

  const getProgress = (itemId: number): number | null => {
    if (currentDownload?.queue_id === itemId) {
      return currentDownload.percent;
    }
    return null;
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
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">下载队列</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {stats ? `${stats.pending} 等待 · ${stats.downloading} 下载中 · ${stats.completed} 完成` : "管理当前和历史任务"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BatchAddDialog 
            trigger={
              <Button 
                variant="default" 
                size="sm" 
                className="h-9 rounded-full active:scale-95 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> 批量添加
              </Button>
            }
            onSuccess={() => fetchData(true)}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 rounded-full hover:bg-accent/50 active:scale-95 transition-all"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 刷新
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">队列为空</p>
          <p className="text-sm text-muted-foreground/70">搜索并下载歌曲后将显示在这里</p>
        </div>
      ) : (
        <>
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
                {items.map((item) => {
                  const progress = getProgress(item.id);
                  return (
                    <TableRow key={item.id} className="group hover:bg-accent/30 border-border/60 transition-colors">
                      <TableCell className="font-medium text-muted-foreground pl-6">#{item.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 py-1">
                          <span className="font-medium">{item.song_name}</span>
                          {progress !== null && (
                            <div className="w-[80%] flex items-center gap-3">
                              <Progress value={progress} className="h-1.5 bg-secondary/50" />
                              <span className="text-xs font-medium text-muted-foreground tabular-nums">{Math.round(progress)}%</span>
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
                        {getStatusBadge(item.status, item.id)}
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
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {items.map((item) => {
              const progress = getProgress(item.id);
              return (
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
                    {getStatusBadge(item.status, item.id)}
                  </div>

                  {progress !== null && (
                    <div className="mb-3 space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>下载中...</span>
                        <span>{Math.round(progress)}%</span>
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
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="h-8 rounded-full text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                       onClick={() => handleDelete(item.id)}
                     >
                       <Trash2 className="mr-1.5 h-3 w-3" /> 删除
                     </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
