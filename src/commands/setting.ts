import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

/** getChatMember 返回的 ChatMember 结构（仅关心 status） */
interface ChatMemberResult {
    ok: boolean;
    result?: { status: string };
}

const settingCommand: CommandHandler = {
    name: "setting",
    description: "设置命令，仅管理员可访问示例设置界面",
    execute: async (update: TelegramUpdate) => {
        const message = update.message;
        const chatId = message?.chat.id;
        const chatType = message?.chat.type;
        const fromId = message?.from?.id;

        if (!chatId) {
            console.error("Chat ID not found in setting command.");
            return null;
        }

        // 如果是私聊，通常认为发起者就是“管理员”
        let isAdmin = chatType === "private";

        if (chatType === "group" || chatType === "supergroup") {
            if (fromId == null) {
                return {
                    method: "sendMessage",
                    chat_id: chatId,
                    text: "❌ 无法获取发送者信息。",
                    parse_mode: "HTML",
                };
            }

            const token = process.env.BOT_TOKEN;
            if (!token) {
                return {
                    method: "sendMessage",
                    chat_id: chatId,
                    text: "❌ 未配置 BOT_TOKEN 环境变量，无法校验权限。",
                    parse_mode: "HTML",
                };
            }

            // 调用 getChatMember 判断是否为群聊管理员
            const url = `${TELEGRAM_API_BASE}${token}/getChatMember?chat_id=${encodeURIComponent(String(chatId))}&user_id=${fromId}`;
            try {
                const res = await fetch(url);
                const data = (await res.json()) as ChatMemberResult;
                if (data?.ok && data.result) {
                    const status = data.result.status;
                    isAdmin = status === "creator" || status === "administrator";
                }
            } catch (e) {
                console.error("getChatMember failed:", e);
                return {
                    method: "sendMessage",
                    chat_id: chatId,
                    text: "❌ 校验管理员身份时发生错误，请稍后重试。",
                    parse_mode: "HTML",
                };
            }
        }

        if (!isAdmin) {
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: `❌ <b>权限拒绝</b>\n只有管理员才能使用此命令。`,
                parse_mode: "HTML",
            };
        }

        // 管理员校验通过，直接在回复中展示简单的内联按钮设置界面样例
        return {
            method: "sendMessage",
            chat_id: chatId,
            text: "⚙️ <b>机器人设置 (示例)</b>\n\n这是一个纯内联按钮形式的设置界面样例，不做任何实际功能实现，仅供测试。",
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "🔔 通知: 开启", callback_data: "toggle_notify" },
                        { text: "🛡️ 安全: 增强", callback_data: "toggle_security" }
                    ],
                    [
                        { text: "🌐 语言: 简体中文", callback_data: "change_lang" }
                    ],
                    [
                        { text: "✅ 保存设置", callback_data: "save_settings" },
                        { text: "❌ 取消", callback_data: "cancel_settings" }
                    ]
                ]
            }
        };
    },
};

export default settingCommand;
