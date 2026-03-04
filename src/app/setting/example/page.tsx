"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Shield, User } from "lucide-react";

export default function ExampleSettingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            机器人设置 (示例)
          </CardTitle>
          <CardDescription>
            这是一个仅供测试的设置界面样例，没有任何实际功能实现。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="general"><Settings className="h-4 w-4 mr-2" />常规</TabsTrigger>
              <TabsTrigger value="notify"><Bell className="h-4 w-4 mr-2" />通知</TabsTrigger>
              <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />安全</TabsTrigger>
              <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />个人</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>启用自动回复</Label>
                  <p className="text-xs text-muted-foreground">当用户发送消息时自动回复</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>静默模式</Label>
                  <p className="text-xs text-muted-foreground">在夜间不发送任何通知</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>机器人名称</Label>
                <Input placeholder="输入机器人显示名称" defaultValue="My Awesome Bot" />
              </div>
            </TabsContent>

            <TabsContent value="notify" className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label>新用户加入通知</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label>错误日志推送</Label>
                <Switch />
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <Label>仅限管理员使用</Label>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>访问令牌 (Token)</Label>
                <Input type="password" value="••••••••••••••••" readOnly />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4 text-center py-8">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-medium">管理员用户</h3>
              <p className="text-sm text-muted-foreground">ID: 123456789</p>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline">取消</Button>
            <Button onClick={() => alert("这只是一个样例，没有实际保存功能。")}>保存设置</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
