"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Loader2, AlertCircle, Moon, Sun, Trash2, ShieldCheck, Settings, Terminal, Info } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TelegramApiResponse } from "@/types/TelegramApiResponse";
import type { BotCommand, WebhookInfo, User as TelegramUser } from "@/types/telegram";

import { BotInfoCard } from "./components/BotInfoCard";
import { CommandManager } from "./components/CommandManager";

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
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{ success: boolean; message: string } | null>(null);

  // 指令管理状态
  const [commands, setCommands] = useState<BotCommand[]>([]);
  const [isLoadingCommands, setIsLoadingCommands] = useState(false);
  const [isSavingCommands, setIsSavingCommands] = useState(false);
  const [commandsStatus, setCommandsStatus] = useState<{ success: boolean; message: string } | null>(null);

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

  // 切换内联模式
  const handleToggleInlineMode = async (enabled: boolean) => {
    alert(`内联模式切换为: ${enabled ? '开启' : '关闭'}。请注意，内联模式通常需要在 @BotFather 处进行配置。`);
    
    if (botInfo) {
      setBotInfo({
        ...botInfo,
        supports_inline_queries: enabled
      });
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
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  基本信息与配置
                </TabsTrigger>
                <TabsTrigger value="commands" className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  指令管理
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6 animate-in fade-in-50 duration-300">
                <BotInfoCard 
                  botInfo={botInfo}
                  webhookUrl={webhookUrl}
                  setWebhookUrl={setWebhookUrl}
                  handleSetWebhook={handleSetWebhook}
                  isSettingWebhook={isSettingWebhook}
                  webhookStatus={webhookStatus}
                  onToggleInlineMode={handleToggleInlineMode}
                />
              </TabsContent>
              
              <TabsContent value="commands" className="space-y-6 animate-in fade-in-50 duration-300">
                <CommandManager 
                  commands={commands}
                  isLoadingCommands={isLoadingCommands}
                  isSavingCommands={isSavingCommands}
                  commandsStatus={commandsStatus}
                  setCommands={setCommands}
                  saveCommands={saveCommands}
                  setCommandsStatus={setCommandsStatus}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/50 dark:bg-white/5 rounded-b-xl border-t py-4 text-[11px] text-muted-foreground flex justify-between">
          <span>当前状态: {botInfo ? "已连接" : "未配置"}</span>
          <span className="hover:text-primary transition-colors cursor-help">如何获取 Token?</span>
        </CardFooter>
      </Card>
    </div>
  );
}
