"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Loader2, AlertCircle, Moon, Sun, Trash2, ShieldCheck, CheckCircle2, Plus, Edit, X } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { TelegramApiResponse } from "@/types/TelegramApiResponse";
import type { BotCommand, WebhookInfo, User as TelegramUser } from "@/types/telegram";

/**
 * Telegram 机器人信息的详细字段
 */
interface TelegramBotInfo extends TelegramUser {
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
  can_connect_to_business: boolean;
  has_main_web_app: boolean;
  has_topics_enabled: boolean;
  allows_users_to_create_topics: boolean;
}

export default function SettingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState("");
  const [botInfo, setBotInfo] = useState<TelegramBotInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Webhook 状态
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{ success: boolean; message: string } | null>(null);

  // 指令管理状态
  const [commands, setCommands] = useState<BotCommand[]>([]);
  const [isLoadingCommands, setIsLoadingCommands] = useState(false);
  const [isSavingCommands, setIsSavingCommands] = useState(false);
  const [commandsStatus, setCommandsStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // 编辑对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCommand, setEditCommand] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [commandError, setCommandError] = useState<string | null>(null);

  // 初始化：从本地存储读取已保存的 Token
  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem("tg_bot_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // 获取信息
  const fetchBotInfo = async () => {
    if (!token.trim()) {
      setError("请输入有效的 Bot Token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data: TelegramApiResponse<TelegramBotInfo> = await response.json();

      if (data.ok) {
        setBotInfo(data.result);
        localStorage.setItem("tg_bot_token", token);
        
        // 自动获取 webhook 和指令信息
        await fetchWebhookInfo();
        await fetchCommands();
      } else {
        setError(data.description || "Token 校验失败");
      }
    } catch (err) {
      setError("无法连接到 Telegram 服务器，请检查网络环境。");
    } finally {
      setLoading(false);
    }
  };

  // 获取 Webhook 信息
  const fetchWebhookInfo = async () => {
    try {
      const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const webhookInfoData: TelegramApiResponse<WebhookInfo> = await webhookInfoResponse.json();

      if (webhookInfoData.ok) {
        setWebhookInfo(webhookInfoData.result);
        setWebhookUrl(webhookInfoData.result.url);
      }
    } catch (err) {
      console.error("获取 Webhook 信息失败", err);
    }
  };

  // 获取指令列表
  const fetchCommands = async () => {
    setIsLoadingCommands(true);
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMyCommands`);
      const data: TelegramApiResponse<BotCommand[]> = await response.json();

      if (data.ok) {
        setCommands(data.result);
      }
    } catch (err) {
      console.error("获取指令列表失败", err);
    } finally {
      setIsLoadingCommands(false);
    }
  };

  // 保存指令列表
  const saveCommands = async () => {
    setIsSavingCommands(true);
    setCommandsStatus(null);

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commands }),
      });
      const data: TelegramApiResponse<boolean> = await response.json();

      if (data.ok) {
        setCommandsStatus({ success: true, message: "指令列表保存成功！" });
      } else {
        setCommandsStatus({ success: false, message: data.description || "保存失败" });
      }
    } catch (err) {
      setCommandsStatus({ success: false, message: "请求失败，请稍后重试" });
    } finally {
      setIsSavingCommands(false);
    }
  };

  // 验证指令格式
  const validateCommand = (command: string, description: string): string | null => {
    if (!command.trim()) {
      return "指令名称不能为空";
    }
    if (command.length < 1 || command.length > 32) {
      return "指令名称长度必须在 1-32 个字符之间";
    }
    if (!/^[a-z0-9_]+$/.test(command)) {
      return "指令名称只能包含小写字母、数字和下划线";
    }
    if (!description.trim()) {
      return "指令描述不能为空";
    }
    if (description.length < 1 || description.length > 256) {
      return "指令描述长度必须在 1-256 个字符之间";
    }
    return null;
  };

  // 打开添加指令对话框
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

  // 打开编辑指令对话框
  const handleEditCommand = (index: number) => {
    setEditingIndex(index);
    setEditCommand(commands[index].command);
    setEditDescription(commands[index].description);
    setCommandError(null);
    setIsDialogOpen(true);
  };

  // 保存编辑的指令
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
      // 编辑现有指令
      const newCommands = [...commands];
      newCommands[editingIndex] = newCommand;
      setCommands(newCommands);
    } else {
      // 添加新指令
      setCommands([...commands, newCommand]);
    }

    setIsDialogOpen(false);
    setCommandsStatus(null);
  };

  // 删除指令
  const handleDeleteCommand = (index: number) => {
    const newCommands = commands.filter((_, i) => i !== index);
    setCommands(newCommands);
    setCommandsStatus(null);
  };

  // 设置 Webhook 逻辑
  const handleSetWebhook = async () => {
    if (!webhookUrl.startsWith("https://")) {
      setWebhookStatus({ success: false, message: "Webhook URL 必须以 https:// 开头" });
      return;
    }

    setIsSettingWebhook(true);
    setWebhookStatus(null);

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const data: TelegramApiResponse<undefined> = await response.json();

      if (data.ok) {
        setWebhookStatus({ success: true, message: "Webhook 设置成功！" });
      } else {
        setWebhookStatus({ success: false, message: data.description });
      }
    } catch (err) {
      setWebhookStatus({ success: false, message: "请求失败，请稍后重试" });
    } finally {
      setIsSettingWebhook(false);
    }
  };

  // 清除配置
  const handleReset = () => {
    setToken("");
    setBotInfo(null);
    setCommands([]);
    localStorage.removeItem("tg_bot_token");
    setWebhookStatus(null);
    setCommandsStatus(null);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-4xl border-none shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">机器人设置</CardTitle>
            <CardDescription>管理您的 Telegram Bot 访问凭据和指令</CardDescription>
          </div>
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-orange-500" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="token" className="text-sm font-semibold">Bot API Token</Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> 加密传输
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                id="token"
                placeholder="123456789:ABCDefGh..."
                type="password"
                className="font-mono text-sm transition-all focus-visible:ring-primary/20"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              {!botInfo ? (
                <Button onClick={fetchBotInfo} disabled={loading} className="px-6">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "连接"}
                </Button>
              ) : (
                <Button variant="outline" size="icon" onClick={handleReset} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {botInfo && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-6 animate-in zoom-in-95 duration-300">
              {/* 头部状态 */}
              <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold text-primary">服务已就绪</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  ID: {botInfo.id}
                </span>
              </div>

              {/* 核心基础信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">显示名称</p>
                  <p className="font-semibold text-sm">{botInfo.first_name}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">用户名</p>
                  <p className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                    @{botInfo.username}
                  </p>
                </div>
              </div>

              {/* 详细功能开关列表 */}
              <div className="space-y-3 pt-2">
                <Label>功能权限与配置</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                  {[
                    { label: "机器人身份", value: botInfo.is_bot },
                    { label: "加入群组", value: botInfo.can_join_groups },
                    { label: "读取群消息", value: botInfo.can_read_all_group_messages },
                    { label: "内联查询", value: botInfo.supports_inline_queries },
                    { label: "连接商业帐号", value: botInfo.can_connect_to_business },
                    { label: "主 Web App", value: botInfo.has_main_web_app },
                    { label: "话题功能", value: botInfo.has_topics_enabled },
                    { label: "创建话题权限", value: botInfo.allows_users_to_create_topics },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/40">
                      <span className="text-muted-foreground">{item.label}</span>
                      {item.value ? (
                        <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-medium border border-green-500/20">
                          开启
                        </span>
                      ) : (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium border border-border">
                          关闭
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhook 设置 */}
              <div className="space-y-3 pt-2">
                <Label>Webhook 配置</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook"
                    placeholder="https://your-api.com/webhook"
                    className="text-sm"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={handleSetWebhook}
                    disabled={isSettingWebhook || !webhookUrl}
                  >
                    {isSettingWebhook ? <Loader2 className="h-4 w-4 animate-spin" /> : "更新"}
                  </Button>
                </div>

                {webhookStatus && (
                  <div className={`flex items-center gap-2 text-xs p-2 rounded border ${webhookStatus.success ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}>
                    {webhookStatus.success ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {webhookStatus.message}
                  </div>
                )}
              </div>

              {/* 指令管理 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label>指令管理</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddCommand}
                      disabled={commands.length >= 100}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      添加指令
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveCommands}
                      disabled={isSavingCommands || commands.length === 0}
                    >
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
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    暂无指令，点击"添加指令"开始配置
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 桌面端表格视图 */}
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleEditCommand(index)}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteCommand(index)}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 手机端卡片视图 */}
                    <div className="md:hidden space-y-2">
                      {commands.map((cmd, index) => (
                        <div key={index} className="rounded-lg border bg-background p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">
                                /{cmd.command}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1 break-words">
                                {cmd.description}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditCommand(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteCommand(index)}
                              >
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
                  <div className={`flex items-center gap-2 text-xs p-2 rounded border ${commandsStatus.success ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}>
                    {commandsStatus.success ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {commandsStatus.message}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  已添加 {commands.length} / 100 个指令
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/50 dark:bg-white/5 rounded-b-xl border-t py-4 text-[11px] text-muted-foreground flex justify-between">
          <span>当前状态: {botInfo ? "已连接" : "未配置"}</span>
          <span className="hover:text-primary transition-colors cursor-help">如何获取 Token?</span>
        </CardFooter>
      </Card>

      {/* 编辑指令对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "编辑指令" : "添加指令"}</DialogTitle>
            <DialogDescription>
              指令名称只能包含小写字母、数字和下划线，长度 1-32 字符
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="command">指令名称</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <Input
                  id="command"
                  placeholder="start"
                  value={editCommand}
                  onChange={(e) => setEditCommand(e.target.value.toLowerCase())}
                  className="font-mono"
                  maxLength={32}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {editCommand.length} / 32 字符
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">指令描述</Label>
              <Textarea
                id="description"
                placeholder="启动机器人"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                maxLength={256}
              />
              <div className="text-xs text-muted-foreground">
                {editDescription.length} / 256 字符
              </div>
            </div>
            {commandError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{commandError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCommand}>
              {editingIndex !== null ? "保存" : "添加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
