import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const originalCommand: CommandHandler = {
    name: "original",
    description: "原样返回机器人接收到的原始数据",
    execute: async (update: TelegramUpdate, args?: string[]) => {
        const chatId = update.message?.chat.id;

        if (!chatId) {
            console.error("Chat ID not found in original command.");
            return null;
        }

        let originalJson = JSON.stringify(update, null, 2);

        // Telegram 消息长度限制为 4096 字符
        // 我们留出一些余量给 <code> 标签
        if (originalJson.length > 4000) {
            originalJson = originalJson.substring(0, 4000) + "\n... (内容过长已截断)";
        }

        return {
            method: "sendMessage",
            chat_id: chatId,
            text: `<code>${originalJson}</code>`,
            parse_mode: "HTML"
        };
    },
};

export default originalCommand;
