import { NextResponse } from 'next/server';
import { TelegramUpdate } from '@/types/telegram';
import { commandDispatcher } from '@/lib/command-dispatcher';
import { inlineQueryDispatcher } from '@/lib/inline-query-dispatcher';
import infoCommand from '@/commands/info';
import originalCommand from '@/commands/original';
import pmCommand from '@/commands/pm';
import adminCommand from '@/commands/admin';
import settingCommand from '@/commands/setting';
import submissionCommand from '@/commands/submission';
import pmInlineHandler from '@/commands/pm-inline';
import helpInlineHandler from '@/commands/help-inline';

// 注册所有指令
commandDispatcher.registerCommand(infoCommand);
commandDispatcher.registerCommand(originalCommand);
commandDispatcher.registerCommand(pmCommand);
commandDispatcher.registerCommand(adminCommand);
commandDispatcher.registerCommand(settingCommand);
commandDispatcher.registerCommand(submissionCommand);

// 注册所有内联查询处理器
inlineQueryDispatcher.registerHandler(pmInlineHandler);
inlineQueryDispatcher.registerHandler(helpInlineHandler);

export async function POST(request: Request) {
    try {
        const body: TelegramUpdate = await request.json();

        // 处理内联查询
        if (body.inline_query) {
            const inlineResponse = await inlineQueryDispatcher.dispatch(body.inline_query);
            if (inlineResponse) {
                return inlineResponse;
            }
        }

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
