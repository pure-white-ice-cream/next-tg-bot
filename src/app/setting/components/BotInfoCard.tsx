"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User as TelegramUser } from "@/types/telegram";

interface TelegramBotInfo extends TelegramUser {
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
  can_connect_to_business: boolean;
  has_main_web_app: boolean;
  has_topics_enabled: boolean;
  allows_users_to_create_topics: boolean;
}

interface BotInfoCardProps {
  botInfo: TelegramBotInfo;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  handleSetWebhook: () => void;
  isSettingWebhook: boolean;
  webhookStatus: { success: boolean; message: string } | null;
  onToggleInlineMode: (enabled: boolean) => void;
}

export function BotInfoCard({
  botInfo,
  webhookUrl,
  setWebhookUrl,
  handleSetWebhook,
  isSettingWebhook,
  webhookStatus,
  onToggleInlineMode,
}: BotInfoCardProps) {
  return (
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
            { label: "内联查询", value: botInfo.supports_inline_queries, isSwitch: true, key: 'inline' },
            { label: "连接商业帐号", value: botInfo.can_connect_to_business },
            { label: "主 Web App", value: botInfo.has_main_web_app },
            { label: "话题功能", value: botInfo.has_topics_enabled },
            { label: "创建话题权限", value: botInfo.allows_users_to_create_topics },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/40">
              <span className="text-muted-foreground">{item.label}</span>
              {item.isSwitch ? (
                <Switch 
                  checked={item.value} 
                  onCheckedChange={(checked) => {
                    if (item.key === 'inline') onToggleInlineMode(checked);
                  }}
                />
              ) : item.value ? (
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
    </div>
  );
}
