import { TelegramUpdate, BotCommand } from "@/types/telegram";
import { commandDispatcher } from "./command-dispatcher";
import { NextResponse } from "next/server";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

interface CallbackHandlerResult {
    method: string;
    chat_id?: number;
    callback_query_id?: string;
    text?: string;
    parse_mode?: string;
    [key: string]: any;
}

/**
 * 处理回调查询（callback_query）
 */
export async function handleCallbackQuery(update: TelegramUpdate): Promise<NextResponse | null> {
    const callbackQuery = update.callback_query;

    if (!callbackQuery || !callbackQuery.data) {
        return null;
    }

    const callbackData = callbackQuery.data;
    const callbackQueryId = callbackQuery.id;
    const chatId = callbackQuery.message?.chat.id;
    const messageId = callbackQuery.message?.message_id;
    const fromId = callbackQuery.from.id;

    // 处理刷新指令描述的回调
    if (callbackData === "refresh_commands") {
        if (!chatId) {
            return NextResponse.json({
                method: "answerCallbackQuery",
                callback_query_id: callbackQueryId,
                text: "❌ 无法获取聊天信息",
                show_alert: true,
            });
        }

        try {
            // 获取所有已注册的指令
            const commands = commandDispatcher.getRegisteredCommands();

            // 构建 BotCommand 数组
            const botCommands: BotCommand[] = commands.map(cmd => ({
                command: cmd.name,
                description: cmd.description,
            }));

            // 调用 Telegram API 的 setMyCommands 方法
            const token = process.env.BOT_TOKEN;
            if (!token) {
                return NextResponse.json({
                    method: "answerCallbackQuery",
                    callback_query_id: callbackQueryId,
                    text: "❌ 未配置 BOT_TOKEN 环境变量",
                    show_alert: true,
                });
            }

            const url = `${TELEGRAM_API_BASE}${token}/setMyCommands`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    commands: botCommands,
                }),
            });

            const result = await response.json() as { ok: boolean; description?: string };

            if (result.ok) {
                // 发送成功提示
                const successMessage = {
                    method: "editMessageText",
                    chat_id: chatId,
                    message_id: messageId,
                    text: `✅ <b>指令描述已刷新</b>\n\n已注册 ${botCommands.length} 个指令：\n\n${botCommands.map(cmd => `• /${cmd.command} - ${cmd.description}`).join("\n")}`,
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "🔄 重新刷新", callback_data: "refresh_commands" },
                                { text: "❌ 关闭", callback_data: "close_message" }
                            ]
                        ]
                    }
                };

                return NextResponse.json(successMessage);
            } else {
                return NextResponse.json({
                    method: "answerCallbackQuery",
                    callback_query_id: callbackQueryId,
                    text: `❌ 刷新失败: ${result.description || "未知错误"}`,
                    show_alert: true,
                });
            }
        } catch (error) {
            console.error("刷新指令描述时发生错误:", error);
            return NextResponse.json({
                method: "answerCallbackQuery",
                callback_query_id: callbackQueryId,
                text: "❌ 刷新指令描述时发生错误，请稍后重试",
                show_alert: true,
            });
        }
    }

    // 处理关闭消息的回调
    if (callbackData === "close_message") {
        return NextResponse.json({
            method: "deleteMessage",
            chat_id: chatId,
            message_id: messageId,
        });
    }

    // 处理其他回调（示例）
    return NextResponse.json({
        method: "answerCallbackQuery",
        callback_query_id: callbackQueryId,
        text: `您点击了: ${callbackData}`,
        show_alert: false,
    });
}
