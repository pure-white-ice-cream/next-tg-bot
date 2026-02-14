import { NextResponse } from 'next/server';

// 定义 Telegram 消息中的基础对象
interface Chat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    username?: string;
    first_name?: string;
}

interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
}

interface Message {
    message_id: number;
    from?: User;
    chat: Chat;
    date: number;
    text?: string;
    // 如果需要处理图片或指令，可以继续添加 photo?: any[], entities?: any[]
}

// 核心：Telegram Webhook 推送的根对象
export interface TelegramUpdate {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    callback_query?: any; // 以后处理按钮点击时会用到
}

export async function POST(request: Request) {
    try {
        // 使用泛型或断言指定类型
        const body: TelegramUpdate = await request.json();

        // 此时 body.message 已经有了自动补全
        if (!body.message || !body.message.text) {
            return NextResponse.json({ ok: true });
        }

        const { id: chatId } = body.message.chat;
        const text = body.message.text;

        if (text === '/info') {
            const infoText = `
<b>🤖 机器人信息卡</b>
--------------------------
<b>您的 ID:</b> <code>${body.message.from?.id}</code>
<b>聊天 ID:</b> <code>${chatId}</code>
<b>消息 ID:</b> <code>${body.message.message_id}</code>
            `;

            return NextResponse.json({
                method: "sendMessage",
                chat_id: chatId,
                text: infoText,
                parse_mode: "HTML"
            });
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("解析错误:", error);
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}