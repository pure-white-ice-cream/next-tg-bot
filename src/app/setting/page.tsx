"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Moon, Sun, Laptop } from "lucide-react";

/** --- TypeScript 类型定义 --- **/
interface TelegramBotResult {
  id: number;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: TelegramBotResult;
  description?: string;
}

export default function SettingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // 避免水合不匹配
  const [token, setToken] = useState("");
  const [botInfo, setBotInfo] = useState<TelegramBotResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 确保组件已挂载，防止 Next.js 服务端渲染颜色与客户端不符
  useEffect(() => setMounted(true), []);

  const fetchBotInfo = async () => {
    if (!token) {
      setError("请输入 Bot Token");
      return;
    }
    setLoading(true);
    setError(null);
    setBotInfo(null);
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data: TelegramResponse = await response.json();
      if (data.ok && data.result) {
        setBotInfo(data.result);
      } else {
        setError(data.description || "Token 无效，请检查。");
      }
    } catch (err) {
      setError("网络连接失败，请检查 API 访问环境。");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    // 外层容器：实现全屏居中，响应式内边距
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 md:p-8">

      <Card className="w-full max-w-lg shadow-2xl transition-all duration-300">
        <CardHeader className="relative">
          {/* 主题切换按钮 - 位于卡片右上角 */}
          <div className="absolute right-4 top-4 flex gap-1 bg-muted rounded-full p-1">
            <Button
              variant={theme === "light" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === "dark" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" />
            </Button>
          </div>

          <CardTitle className="text-xl md:text-2xl font-bold">机器人设置</CardTitle>
          <CardDescription>配置 Telegram 密钥以同步信息</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Token 输入 */}
          <div className="space-y-2">
            <Label htmlFor="token">Bot Token</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="token"
                placeholder="在此粘贴 Token..."
                type="password"
                className="flex-1"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Button onClick={fetchBotInfo} disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "验证"}
              </Button>
            </div>
          </div>

          {/* 错误显示 */}
          {error && (
            <Alert variant="destructive" className="py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* 结果显示 - 适配移动端栅格 */}
          {botInfo && (
            <div className="rounded-lg border bg-card text-card-foreground p-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-bold">验证成功</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">昵称</p>
                  <p className="font-medium break-all">{botInfo.first_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">用户名</p>
                  <p className="font-medium text-blue-500 italic">@{botInfo.username}</p>
                </div>
                <div className="space-y-1 sm:col-span-2 border-t pt-2">
                  <p className="text-muted-foreground text-xs">机器人 ID: <span className="font-mono">{botInfo.id}</span></p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" size="lg" disabled={!botInfo}>
            保存当前配置
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            设置将同步至您的本地存储空间
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}