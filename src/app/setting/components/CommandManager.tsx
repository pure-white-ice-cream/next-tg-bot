"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BotCommand } from "@/types/telegram";

interface CommandManagerProps {
  commands: BotCommand[];
  isLoadingCommands: boolean;
  isSavingCommands: boolean;
  commandsStatus: { success: boolean; message: string } | null;
  setCommands: (commands: BotCommand[]) => void;
  saveCommands: () => void;
  setCommandsStatus: (status: { success: boolean; message: string } | null) => void;
}

export function CommandManager({
  commands,
  isLoadingCommands,
  isSavingCommands,
  commandsStatus,
  setCommands,
  saveCommands,
  setCommandsStatus,
}: CommandManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCommand, setEditCommand] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [commandError, setCommandError] = useState<string | null>(null);

  const validateCommand = (command: string, description: string): string | null => {
    if (!command.trim()) return "指令名称不能为空";
    if (command.length < 1 || command.length > 32) return "指令名称长度必须在 1-32 个字符之间";
    if (!/^[a-z0-9_]+$/.test(command)) return "指令名称只能包含小写字母、数字和下划线";
    if (!description.trim()) return "指令描述不能为空";
    if (description.length < 1 || description.length > 256) return "指令描述长度必须在 1-256 个字符之间";
    return null;
  };

  const handleAddCommand = () => {
    if (commands.length >= 100) {
      setCommandsStatus({ success: false, message: "最多只能添加 100 个指令" });
      return;
    }
    setEditingIndex(null);
    setEditCommand("");
    setEditDescription("");
    setCommandError(null);
    setIsDialogOpen(true);
  };

  const handleEditCommand = (index: number) => {
    setEditingIndex(index);
    setEditCommand(commands[index].command);
    setEditDescription(commands[index].description);
    setCommandError(null);
    setIsDialogOpen(true);
  };

  const handleSaveCommand = () => {
    const error = validateCommand(editCommand, editDescription);
    if (error) {
      setCommandError(error);
      return;
    }

    const newCommand: BotCommand = {
      command: editCommand.toLowerCase(),
      description: editDescription,
    };

    if (editingIndex !== null) {
      const newCommands = [...commands];
      newCommands[editingIndex] = newCommand;
      setCommands(newCommands);
    } else {
      setCommands([...commands, newCommand]);
    }

    setIsDialogOpen(false);
    setCommandsStatus(null);
  };

  const handleDeleteCommand = (index: number) => {
    const newCommands = commands.filter((_, i) => i !== index);
    setCommands(newCommands);
    setCommandsStatus(null);
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <Label>指令管理</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddCommand} disabled={commands.length >= 100}>
            <Plus className="h-4 w-4 mr-1" />
            添加指令
          </Button>
          <Button size="sm" onClick={saveCommands} disabled={isSavingCommands || commands.length === 0}>
            {isSavingCommands ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            保存到 Telegram
          </Button>
        </div>
      </div>

      {isLoadingCommands ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : commands.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">暂无指令，点击"添加指令"开始配置</div>
      ) : (
        <div className="space-y-2">
          <div className="hidden md:block rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">指令</th>
                  <th className="text-left p-3 font-medium">描述</th>
                  <th className="text-right p-3 font-medium w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {commands.map((cmd, index) => (
                  <tr key={index} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-blue-600 dark:text-blue-400">/{cmd.command}</td>
                    <td className="p-3">{cmd.description}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCommand(index)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCommand(index)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {commands.map((cmd, index) => (
              <div key={index} className="rounded-lg border bg-background p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">/{cmd.command}</div>
                    <div className="text-sm text-muted-foreground mt-1 break-words">{cmd.description}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCommand(index)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCommand(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {commandsStatus && (
        <div className={`flex items-center gap-2 text-xs p-2 rounded border ${commandsStatus.success ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
          {commandsStatus.success ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {commandsStatus.message}
        </div>
      )}

      <div className="text-xs text-muted-foreground">已添加 {commands.length} / 100 个指令</div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "编辑指令" : "添加指令"}</DialogTitle>
            <DialogDescription>指令名称只能包含小写字母、数字和下划线，长度 1-32 字符</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="command">指令名称</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <Input id="command" placeholder="start" value={editCommand} onChange={(e) => setEditCommand(e.target.value.toLowerCase())} className="font-mono" maxLength={32} />
              </div>
              <div className="text-xs text-muted-foreground">{editCommand.length} / 32 字符</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">指令描述</Label>
              <Textarea id="description" placeholder="启动机器人" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} maxLength={256} />
              <div className="text-xs text-muted-foreground">{editDescription.length} / 256 字符</div>
            </div>
            {commandError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{commandError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveCommand}>{editingIndex !== null ? "保存" : "添加"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
