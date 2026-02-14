import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await request.json();
    console.log(body);

    return NextResponse.json({
        "method": "sendMessage",
        "chat_id": body.message.chat.id,
        "text": "你好！我已经收到你的消息了。",
        "parse_mode": "HTML"
    }, { status: 200 });
}
