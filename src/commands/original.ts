import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const originalCommand: CommandHandler = {
    name: "original",
    description: "原样返回机器人接收到的原始数据",
    execute: async (update: TelegramUpdate) => {
        const chatId = update.message?.chat.id;

        if (!chatId) {
            console.error("Chat ID not found in original command.");
            return null;
        }

        const originalJson = JSON.stringify(update, null, 2);

        return {
            method: "sendMessage",
            chat_id: chatId,
            text: `<code>${originalJson}</code>`,
            parse_mode: "HTML"
        };
    },
};

export default originalCommand;
