import { TelegramUpdate, BotCommand } from "@/types/telegram";

const infoCommand: BotCommand = {
    name: "info",
    description: "获取机器人和聊天信息",
    execute: async (update: TelegramUpdate) => {
        const chatId = update.message?.chat.id;
        const fromId = update.message?.from?.id;
        const messageId = update.message?.message_id;

        if (!chatId) {
            console.error("Chat ID not found in info command.");
            return null;
        }

        const infoText = `
<b>🤖 机器人信息卡</b>
--------------------------
<b>您的 ID:</b> <code>${fromId || "N/A"}</code>
<b>聊天 ID:</b> <code>${chatId}</code>
<b>消息 ID:</b> <code>${messageId || "N/A"}</code>
        `;

        return {
            method: "sendMessage",
            chat_id: chatId,
            text: infoText,
            parse_mode: "HTML"
        };
    },
};

export default infoCommand;
