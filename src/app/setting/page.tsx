"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Moon, Sun, Trash2, ShieldCheck, Link, CheckCircle2 } from "lucide-react";

/**
 * 完整的响应类型（联合类型）
 */
type TelegramApiResponse<T> = TelegramSuccessResponse<T> | TelegramErrorResponse;

/**
 * 成功时的响应结构
 */
interface TelegramSuccessResponse<T> {
  ok: true;
  result: T;
}

/**
 * 失败时的响应结构
 */
interface TelegramErrorResponse {
  ok: false;
  error_code: number;
  description: string;
}

/**
 * Telegram 机器人信息的详细字段
 */
interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
  can_connect_to_business: boolean;
  has_main_web_app: boolean;
  has_topics_enabled: boolean;
  allows_users_to_create_topics: boolean;
}

/**
 * Webhook 的详细状态信息
 */
interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
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


  // 初始化：从本地存储读取已保存的 Token
  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem("tg_bot_token");
    if (savedToken) {
      setToken(savedToken);
      // 可选：自动执行一次验证
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
        localStorage.setItem("tg_bot_token", token); // 保存成功后的 Token
      } else {
        setError(data.description || "Token 校验失败");
      }


      const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const webhookInfoData: TelegramApiResponse<WebhookInfo> = await webhookInfoResponse.json();

      if (webhookInfoData.ok) {
        setWebhookInfo(webhookInfoData.result);
        setWebhookUrl(webhookInfoData.result.url);
      } else {
        setError(webhookInfoData.description);
      }
    } catch (err) {
      setError("无法连接到 Telegram 服务器，请检查网络环境。");
    } finally {
      setLoading(false);
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
      const data:TelegramApiResponse<undefined> = await response.json();

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
    localStorage.removeItem("tg_bot_token");
    setWebhookStatus(null)
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-lg border-none shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">机器人设置</CardTitle>
            <CardDescription>管理您的 Telegram Bot 访问凭据</CardDescription>
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
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider border-l-2 border-primary/30 pl-2">
                  功能权限与配置
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                  {/* 我们可以写一个辅助小组件或映射来渲染这些布尔值 */}
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


            </div>
          )}
        </CardContent>

        <CardContent className="space-y-6">
          {botInfo && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-4 rounded-xl border bg-secondary/20 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider text-primary">Webhook 配置</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook" className="text-xs">推送目标 URL (HTTPS)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook"
                      placeholder="https://your-api.com/webhook"
                      className="text-sm"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleSetWebhook}
                      disabled={isSettingWebhook || !webhookUrl}
                    >
                      {isSettingWebhook ? <Loader2 className="h-4 w-4 animate-spin" /> : "更新"}
                    </Button>
                  </div>
                </div>

                {webhookStatus && (
                  <div className={`flex items-center gap-2 text-xs p-2 rounded border ${webhookStatus.success ? "bg-green-500/10 border-green-500/20 text-green-600" : "bg-destructive/10 border-destructive/20 text-destructive"
                    }`}>
                    {webhookStatus.success ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {webhookStatus.message}
                  </div>
                )}
              </div>
            </div>
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