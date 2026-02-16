import { NextResponse } from 'next/server';
import { TelegramUpdate } from '@/types/telegram';
import { commandDispatcher } from '@/lib/command-dispatcher';
import infoCommand from '@/commands/info';

// 注册所有指令
commandDispatcher.registerCommand(infoCommand);

export async function POST(request: Request) {
    try {
        const body: TelegramUpdate = await request.json();

        // 使用指令分发器处理更新
        const response = await commandDispatcher.dispatch(body);

        if (response) {
            return response;
        }

        // 如果没有匹配的指令或指令未返回响应，则返回默认成功响应
        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("处理 Webhook 失败:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
