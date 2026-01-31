"use client";

import { useState, useMemo } from "react";
import { Plus, X, Music, ListPlus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SourceType } from "@/types/api";
import { addToQueue } from "@/lib/api";

interface BatchAddDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BatchAddDialog({ trigger, onSuccess }: BatchAddDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [source, setSource] = useState<SourceType | "all">("all");
  const [priority, setPriority] = useState<"normal" | "high">("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse songs from text (one per line, filter empty lines)
  const songs = useMemo(() => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [text]);

  const handleRemoveSong = (index: number) => {
    const lines = text.split("\n");
    lines.splice(index, 1);
    setText(lines.join("\n"));
  };

  const handleClear = () => {
    setText("");
  };

  const handleSubmit = async () => {
    if (songs.length === 0) {
      toast.error("请输入至少一首歌曲");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await addToQueue({
        songs,
        source: source === "all" ? null : source,
        priority: priority === "high" ? 10 : 0,
      });

      if (res.code === 0 && res.data) {
        toast.success(`已添加 ${res.data.count} 首歌曲到队列`);
        
        // Reset and close
        setText("");
        setSource("all");
        setPriority("normal");
        setOpen(false);
        
        // Callback for parent to refresh
        onSuccess?.();
      } else {
        toast.error(res.message || "添加失败");
      }
    } catch (error) {
      console.error("Failed to add to queue:", error);
      toast.error("添加失败，请检查网络连接");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-9 rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            批量添加
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border-border/60 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ListPlus className="h-5 w-5 text-primary" />
            批量添加到队列
          </DialogTitle>
          <DialogDescription>
            每行输入一首歌曲名称，支持同时添加多首歌曲到下载队列
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                歌曲列表
              </label>
              {songs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  onClick={handleClear}
                  disabled={isSubmitting}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  清空
                </Button>
              )}
            </div>
            <Textarea
              placeholder={"七里香\n稻香\nMojito\n晴天\n..."}
              className="min-h-[160px] resize-none rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors font-mono text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Preview List */}
          {songs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  预览
                </label>
                <Badge variant="secondary" className="font-normal">
                  共 {songs.length} 首
                </Badge>
              </div>
              <div className="max-h-[140px] overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-2 space-y-1">
                {songs.map((song, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 group transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Music className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{song}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveSong(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                音乐来源
              </label>
              <Select 
                value={source} 
                onValueChange={(v: SourceType | "all") => setSource(v)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="rounded-xl border-border/60">
                  <SelectValue placeholder="选择来源" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">自动选择</SelectItem>
                  <SelectItem value="qq">QQ音乐</SelectItem>
                  <SelectItem value="kugou">酷狗</SelectItem>
                  <SelectItem value="kuwo">酷我</SelectItem>
                  <SelectItem value="netease">网易云</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                优先级
              </label>
              <Select 
                value={priority} 
                onValueChange={(v: "normal" | "high") => setPriority(v)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="rounded-xl border-border/60">
                  <SelectValue placeholder="选择优先级" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="normal">普通</SelectItem>
                  <SelectItem value="high">优先下载</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="rounded-xl"
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={songs.length === 0 || isSubmitting}
            className="rounded-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                添加中...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                添加 {songs.length > 0 ? `${songs.length} 首` : ""}到队列
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
